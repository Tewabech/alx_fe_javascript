// =====================
// Storage Keys
// =====================
var LS_QUOTES_KEY = "quotes";
var SS_LAST_VIEWED_KEY = "lastViewedQuote";

// =====================
// State & DOM
// =====================
var quotes = []; // will be loaded from localStorage or seeded defaults

var quoteDisplay = document.getElementById("quoteDisplay");
var newQuoteText = document.getElementById("newQuoteText");
var newQuoteCategory = document.getElementById("newQuoteCategory");
var categorySelect = document.getElementById("categorySelect");
var statusEl = document.getElementById("status");

// =====================
// Initialization
// =====================
function init() {
  loadQuotes();            // from localStorage or defaults
  populateCategories();    // fill dropdown

  // Restore last viewed quote from this session (if any)
  restoreLastViewedQuote();

  // Show a quote automatically when category changes
  categorySelect.addEventListener("change", showRandomQuote);
}

document.addEventListener("DOMContentLoaded", init);

// =====================
// Defaults
// =====================
function defaultQuotes() {
  return [
    { text: "Believe in yourself and all that you are.", category: "Inspiration" },
    { text: "Push yourself, because no one else is going to do it for you.", category: "Inspiration" },
    { text: "I'm on a seafood diet. I see food and I eat it.", category: "Humor" },
    { text: "Why don’t skeletons fight each other? They don’t have the guts.", category: "Humor" }
  ];
}

// =====================
// Local Storage Helpers
// =====================
function saveQuotes() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
    setStatus("Quotes saved.");
  } catch (e) {
    setStatus("Failed to save quotes to Local Storage.", true);
  }
}

function loadQuotes() {
  try {
    var stored = localStorage.getItem(LS_QUOTES_KEY);
    if (stored) {
      var parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        quotes = sanitizeImportedQuotes(parsed, true); // sanitize, allow existing
        return;
      }
    }
  } catch (e) {
    // fall through to defaults
  }
  quotes = defaultQuotes();
  saveQuotes(); // seed storage
}

// =====================
// Session Storage Helpers
// =====================
function setLastViewedQuote(quoteObj) {
  try {
    sessionStorage.setItem(SS_LAST_VIEWED_KEY, JSON.stringify(quoteObj));
  } catch (e) {
    // ignore sessionStorage errors
  }
}

function getLastViewedQuote() {
  try {
    var raw = sessionStorage.getItem(SS_LAST_VIEWED_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

function restoreLastViewedQuote() {
  var last = getLastViewedQuote();
  if (last && last.text && last.category) {
    quoteDisplay.textContent = last.text;
    // If the category exists, select it so the next "Show New Quote" uses it
    var exists = optionExistsInSelect(categorySelect, last.category);
    if (exists) {
      categorySelect.value = last.category;
    }
    setStatus('Restored last viewed quote for this session.');
  } else {
    setStatus('');
  }
}

// =====================
// UI Helpers
// =====================
function setStatus(message, isError) {
  if (!statusEl) return;
  statusEl.textContent = message || "";
  if (isError) {
    statusEl.style.color = "#b91c1c"; // red-700
  } else {
    statusEl.style.color = "#6b7280"; // gray-500
  }
}

function optionExistsInSelect(selectEl, value) {
  for (var i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].value === value) return true;
  }
  return false;
}

// =====================
// Category & Quote Display
// =====================
function populateCategories() {
  categorySelect.innerHTML = "";

  var categories = [];
  for (var i = 0; i < quotes.length; i++) {
    var cat = quotes[i].category;
    if (typeof cat === "string" && cat.trim() !== "" && categories.indexOf(cat) === -1) {
      categories.push(cat);
    }
  }

  for (var j = 0; j < categories.length; j++) {
    var option = document.createElement("option");
    option.value = categories[j];
    option.textContent = categories[j];
    categorySelect.appendChild(option);
  }
}

function showRandomQuote() {
  var selectedCategory = categorySelect.value;

  if (!selectedCategory) {
    quoteDisplay.textContent = "Please select a category.";
    return;
  }

  var filteredQuotes = [];
  for (var i = 0; i < quotes.length; i++) {
    if (quotes[i].category === selectedCategory) {
      filteredQuotes.push(quotes[i]);
    }
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  var randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  var chosen = filteredQuotes[randomIndex];
  quoteDisplay.textContent = chosen.text;

  // Save last viewed quote in this session
  setLastViewedQuote(chosen);
}

// =====================
// Add Quote
// =====================
function addQuote() {
  var text = newQuoteText.value.trim();
  var category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  if (isDuplicateQuote(text)) {
    alert("This quote already exists!");
    return;
  }

  quotes.push({ text: text, category: category });
  saveQuotes();

  if (!optionExistsInSelect(categorySelect, category)) {
    var newOption = document.createElement("option");
    newOption.value = category;
    newOption.textContent = category;
    categorySelect.appendChild(newOption);
  }

  newQuoteText.value = "";
  newQuoteCategory.value = "";
  setStatus("Quote added.");
  alert("Quote added successfully!");
}

function isDuplicateQuote(text) {
  var lowered = text.toLowerCase();
  for (var i = 0; i < quotes.length; i++) {
    if (quotes[i].text && quotes[i].text.toLowerCase() === lowered) {
      return true;
    }
  }
  return false;
}

// =====================
// Export (Download JSON)
// =====================
function exportToJsonFile() {
  try {
    var dataStr = JSON.stringify(quotes, null, 2);
    var blob = new Blob([dataStr], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = makeExportFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus("Quotes exported.");
  } catch (e) {
    setStatus("Failed to export quotes.", true);
  }
}

function makeExportFileName() {
  var now = new Date();
  // e.g., quotes-2025-08-16_03-07-12.json
  var pad = function(n) { return n < 10 ? "0" + n : n; };
  var fname = "quotes-" +
    now.getFullYear() + "-" +
    pad(now.getMonth() + 1) + "-" +
    pad(now.getDate()) + "_" +
    pad(now.getHours()) + "-" +
    pad(now.getMinutes()) + "-" +
    pad(now.getSeconds()) + ".json";
  return fname;
}

// =====================
// Import (Upload JSON)
// =====================
function importFromJsonFile(event) {
  var file = event && event.target && event.target.files ? event.target.files[0] : null;
  if (!file) {
    setStatus("No file selected.", true);
    return;
  }

  var reader = new FileReader();
  reader.onload = function(loadEvent) {
    try {
      var text = loadEvent.target.result;
      var parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        alert("Invalid file format: must be an array of objects.");
        setStatus("Import failed: not an array.", true);
        return;
      }

      // sanitize & dedupe against existing quotes
      var cleaned = sanitizeImportedQuotes(parsed, false);

      // Count additions and duplicates
      var addedCount = 0;
      for (var i = 0; i < cleaned.length; i++) {
        if (!isDuplicateQuote(cleaned[i].text)) {
          quotes.push(cleaned[i]);
          addedCount++;
        }
      }
      var skipped = cleaned.length - addedCount;

      // Persist + refresh UI
      saveQuotes();
      populateCategories();

      alert("Quotes imported successfully! Added: " + addedCount + ", Skipped (duplicates/invalid): " + skipped + ".");
      setStatus("Import complete. Added " + addedCount + ", skipped " + skipped + ".");
    } catch (e) {
      alert("Failed to import: " + e.message);
      setStatus("Import failed: invalid JSON.", true);
    } finally {
      // Clear file input so same file can be re-imported if needed
      event.target.value = "";
    }
  };

  reader.onerror = function() {
    alert("Failed to read the file.");
    setStatus("Import failed: read error.", true);
  };

  reader.readAsText(file);
}

// Ensure each imported item has valid shape {text, category} (strings)
// If allowExisting is true, items already in `quotes` are allowed through (used during load)
// otherwise, they’re just cleaned; dedupe vs existing happens elsewhere.
function sanitizeImportedQuotes(items, allowExisting) {
  var out = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    if (!it || typeof it !== "object") continue;

    var t = it.text;
    var c = it.category;

    if (typeof t !== "string" || typeof c !== "string") continue;

    t = t.trim();
    c = c.trim();
    if (t === "" || c === "") continue;

    // If not allowing existing here, still push; dedupe later via isDuplicateQuote
    // If allowing existing (load), still push; we just want to clean shape.
    out.push({ text: t, category: c });
  }
  return out;
}