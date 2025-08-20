// ---------------- Utility ----------------
function el(tag, text = "", attrs = {}) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  return element;
}

// ---------------- Data ----------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" }
];

let lastViewedQuote = sessionStorage.getItem("lastViewedQuote") || null;

// ---------------- Storage ----------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------------- UI ----------------
function loadCategories() {
  const categorySelect = document.getElementById("categorySelect");
  categorySelect.innerHTML = "";

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = el("option", category, { value: category });
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const category = document.getElementById("categorySelect").value;
  const filteredQuotes = quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    alert("No quotes found for this category.");
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  document.getElementById("quoteDisplay").textContent = randomQuote.text;

  // Save last viewed quote in session
  sessionStorage.setItem("lastViewedQuote", randomQuote.text);
}

function createAddQuoteForm() {
  const form = el("form", "", { id: "quoteForm" });
  const inputText = el("input", "", { type: "text", id: "quoteText", placeholder: "Enter quote text", required: true });
  const inputCategory = el("input", "", { type: "text", id: "quoteCategory", placeholder: "Enter category", required: true });
  const submitBtn = el("button", "Add Quote", { type: "submit" });

  form.append(inputText, inputCategory, submitBtn);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newQuote = {
      text: inputText.value,
      category: inputCategory.value
    };
    quotes.push(newQuote);
    saveQuotes();
    loadCategories();
    form.reset();
    postToServer(newQuote); // push new quote to server
  });

  return form;
}

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 3000);
}

// ---------------- Import / Export ----------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = el("a", "", { href: url, download: "quotes.json" });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      loadCategories();
      showNotification("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ---------------- Server Simulation ----------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL + "?_limit=5");
    const data = await res.json();

    // Transform server data into quotes
    const serverQuotes = data.map(item => ({
      text: item.title,
      category: "Server"
    }));

    // Conflict resolution: server takes precedence
    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    loadCategories();

    showNotification("Quotes updated from server");
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

async function postToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });
    showNotification("Quote synced to server");
  } catch (err) {
    console.error("Post error:", err);
  }
}

// ---------------- Sync Wrapper ----------------
async function syncQuotes() {
  try {
    // Push all local quotes to server
    for (const quote of quotes) {
      await postToServer(quote);
    }
    // Pull from server (server wins)
    await fetchQuotesFromServer();

    showNotification("Quotes synced with server!");
  } catch (err) {
    console.error("Sync error:", err);
    showNotification("Error syncing quotes.");
  }
}

// ---------------- Initialize ----------------
function init() {
  const app = document.getElementById("app");

  const categorySelect = el("select", "", { id: "categorySelect" });
  const showBtn = el("button", "Show Random Quote");
  showBtn.onclick = showRandomQuote;

  const quoteDisplay = el("div", "", { id: "quoteDisplay" });
  const notification = el("div", "", { id: "notification", style: "display:none; background:yellow; padding:5px;" });

  const exportBtn = el("button", "Export Quotes");
  exportBtn.onclick = exportToJsonFile;

  const importInput = el("input", "", { type: "file", accept: ".json" });
  importInput.addEventListener("change", importFromJsonFile);

  const syncBtn = el("button", "Sync Quotes");
  syncBtn.onclick = syncQuotes;

  app.append(categorySelect, showBtn, quoteDisplay, createAddQuoteForm(), exportBtn, importInput, syncBtn, notification);

  loadCategories();

  if (lastViewedQuote) {
    document.getElementById("quoteDisplay").textContent = lastViewedQuote;
  }

  // Auto sync every 15s
  setInterval(syncQuotes, 15000);
}

window.onload = init;