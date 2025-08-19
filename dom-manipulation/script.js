// ===== Storage Keys =====
const STORAGE_KEYS = {
  quotes: "dqg:quotes",
  lastQuote: "dqg:lastQuote",
  lastCategory: "dqg:lastCategory",
};

// ===== Defaults =====
const DEFAULT_QUOTES = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// Use let so we can replace the array on import (after de-duplication)
let quotes = loadQuotes();

// ===== DOM Root =====
const app = document.getElementById("app");

// =============================
// UI CREATION
// =============================
function createUI() {
  // Title
  const title = el("h1", "Dynamic Quote Generator");
  app.appendChild(title);

  // Controls wrapper
  const controls = el("div");
  controls.style.display = "flex";
  controls.style.flexWrap = "wrap";
  controls.style.gap = "10px";
  controls.style.alignItems = "center";
  app.appendChild(controls);

  // Category label/select
  const label = el("label", "Choose Category:");
  label.setAttribute("for", "category");
  const categorySelect = el("select");
  categorySelect.id = "category";
  controls.append(label, categorySelect);

  // Random quote button
  const newQuoteBtn = el("button", "Show Random Quote");
  newQuoteBtn.id = "new-quote";
  controls.appendChild(newQuoteBtn);

  // Quote box
  const quoteBox = el("div", "Select a category to see a quote");
  quoteBox.id = "quote-box";
  app.appendChild(quoteBox);

  // Sub-title
  app.appendChild(el("h2", "Add New Quote"));

  // Add Quote form (dynamic)
  const form = createAddQuoteForm(categorySelect);
  app.appendChild(form);

  // Data management section
  app.appendChild(el("h2", "Import / Export"));

  const dataRow = el("div");
  dataRow.style.display = "flex";
  dataRow.style.flexWrap = "wrap";
  dataRow.style.gap = "10px";
  dataRow.style.alignItems = "center";

  // Export button
  const exportBtn = el("button", "Export Quotes (JSON)");
  exportBtn.addEventListener("click", exportToJsonFile);

  // Import input (accept .json)
  const importInput = el("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  dataRow.append(exportBtn, importInput);
  app.appendChild(dataRow);

  // Optional: Clear storage controls
  const clears = el("div");
  clears.style.display = "flex";
  clears.style.flexWrap = "wrap";
  clears.style.gap = "10px";
  clears.style.marginTop = "6px";

  const clearLocalBtn = el("button", "Clear Local Storage");
  clearLocalBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.quotes);
    showStatus("Local Storage cleared. Reload to restore defaults or import JSON.");
  });
  const clearSessionBtn = el("button", "Clear Session Storage");
  clearSessionBtn.addEventListener("click", () => {
    sessionStorage.removeItem(STORAGE_KEYS.lastQuote);
    sessionStorage.removeItem(STORAGE_KEYS.lastCategory);
    showStatus("Session Storage cleared.");
  });

  clears.append(clearLocalBtn, clearSessionBtn);
  app.appendChild(clears);

  // Status line
  const status = el("div");
  status.id = "status";
  status.style.marginTop = "6px";
  app.appendChild(status);

  // Events
  newQuoteBtn.addEventListener("click", () => {
    showRandomQuote(categorySelect, quoteBox);
  });

  categorySelect.addEventListener("change", () => {
    // Optionally show a quote immediately on category change:
    // showRandomQuote(categorySelect, quoteBox);
    saveLastCategory(categorySelect.value);
  });

  // Initial population
  loadCategories(categorySelect);
  restoreSession(categorySelect, quoteBox);
}

// =============================
// HELPERS
// =============================
function el(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

function showStatus(msg) {
  const status = document.getElementById("status");
  if (status) status.textContent = msg;
}

// =============================
// QUOTES LIST MANAGEMENT
// =============================
function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.quotes);
    if (!raw) return [...DEFAULT_QUOTES];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_QUOTES];
    // Validate shape; keep only valid items
    return sanitizeQuotes(parsed);
  } catch {
    return [...DEFAULT_QUOTES];
  }
}

function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEYS.quotes, JSON.stringify(quotes));
    showStatus("Quotes saved to Local Storage.");
  } catch {
    showStatus("Failed to save quotes (Local Storage).");
  }
}

function sanitizeQuotes(arr) {
  return arr
    .filter(q => q && typeof q.text === "string" && typeof q.category === "string")
    .map(q => ({
      text: q.text.trim(),
      category: q.category.trim()
    }))
    .filter(q => q.text.length && q.category.length);
}

function dedupeQuotes(arr) {
  // Unique by text+category (case-insensitive on category, exact text)
  const map = new Map();
  for (const q of arr) {
    const key = `${q.text}__${q.category.toLowerCase()}`;
    if (!map.has(key)) map.set(key, q);
  }
  return Array.from(map.values());
}

// =============================
// CATEGORIES & DISPLAY
// =============================
function loadCategories(selectElement) {
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  const prev = selectElement.value;
  selectElement.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");

  // Try to preserve previous selection if still present
  if (prev && categories.includes(prev)) {
    selectElement.value = prev;
  }
}

function showRandomQuote(selectElement, quoteBox) {
  const category = selectElement.value;
  const filtered = quotes.filter(q => q.category === category);
  if (!filtered.length) {
    quoteBox.textContent = "No quotes available in this category.";
    return;
  }
  const idx = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[idx];
  quoteBox.textContent = chosen.text;

  // Persist session info
  saveLastQuote(chosen.text);
  saveLastCategory(category);
}

function showSpecificQuote(quoteBox, text) {
  quoteBox.textContent = text;
}

// =============================
// ADD QUOTE FORM (dynamic)
// =============================
function createAddQuoteForm(categorySelect) {
  const form = el("form");
  form.id = "quote-form";

  const quoteInput = el("input");
  quoteInput.type = "text";
  quoteInput.id = "quote-text";
  quoteInput.placeholder = "Enter quote";
  quoteInput.required = true;

  const categoryInput = el("input");
  categoryInput.type = "text";
  categoryInput.id = "quote-category";
  categoryInput.placeholder = "Enter category";
  categoryInput.required = true;

  const submitBtn = el("button", "Add Quote");
  submitBtn.type = "submit";

  form.append(quoteInput, categoryInput, submitBtn);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newQuote = {
      text: quoteInput.value.trim(),
      category: categoryInput.value.trim()
    };
    // Validate
    if (!newQuote.text || !newQuote.category) {
      showStatus("Please provide both quote text and category.");
      return;
    }

    // Add, dedupe, save
    quotes = dedupeQuotes([...quotes, newQuote]);
    saveQuotes();

    // Refresh categories, prefer the new one
    loadCategories(categorySelect);
    categorySelect.value = newQuote.category;
    showStatus(`Added quote in category "${newQuote.category}".`);

    // Reset form
    form.reset();
  });

  return form;
}

// =============================
// SESSION STORAGE (last viewed)
// =============================
function restoreSession(categorySelect, quoteBox) {
  const lastCat = sessionStorage.getItem(STORAGE_KEYS.lastCategory);
  const lastQuote = sessionStorage.getItem(STORAGE_KEYS.lastQuote);

  // Restore category if it still exists
  if (lastCat) {
    const cats = [...new Set(quotes.map(q => q.category))];
    if (cats.includes(lastCat)) {
      categorySelect.value = lastCat;
    }
  }

  // Restore last quote text if present
  if (lastQuote) {
    showSpecificQuote(quoteBox, lastQuote);
    showStatus(`Restored last viewed quote${lastCat ? " (" + lastCat + ")" : ""}.`);
  }
}

function saveLastQuote(text) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.lastQuote, text);
  } catch {}
}

function saveLastCategory(category) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.lastCategory, category);
  } catch {}
}

// =============================
// EXPORT / IMPORT
// =============================
function exportToJsonFile() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    showStatus("Exported quotes to quotes.json.");
  } catch {
    showStatus("Failed to export quotes.");
  }
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    showStatus("No file selected.");
    return;
  }
  if (!file.name.toLowerCase().endsWith(".json")) {
    showStatus("Please select a .json file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) {
        showStatus("Invalid file: expected an array of quotes.");
        return;
      }
      const clean = sanitizeQuotes(imported);
      if (!clean.length) {
        showStatus("No valid quotes found in file.");
        return;
      }

      // Merge + dedupe
      quotes = dedupeQuotes([...quotes, ...clean]);
      saveQuotes();

      // Refresh categories (and try to keep selection)
      const select = document.getElementById("category");
      loadCategories(select);

      showStatus(`Imported ${clean.length} quotes (merged & de-duplicated).`);
      alert("Quotes imported successfully!");
    } catch {
      showStatus("Failed to read JSON. Please check the file contents.");
    } finally {
      // Reset input so selecting the same file again will trigger change
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// =============================
// INIT
// =============================
createUI();
