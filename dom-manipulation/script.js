const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const quoteDisplay = document.getElementById("quoteDisplay");
const quoteForm = document.getElementById("quoteForm");
const quoteTextInput = document.getElementById("quoteText");
const quoteCategoryInput = document.getElementById("quoteCategory");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const notification = document.getElementById("notification"); // NEW UI element

let quotes = [];

// ---------------- Local Storage ----------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// ---------------- Server Simulation ----------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch from server (server takes precedence)
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Simulate server data
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "server"
    }));

    // Conflict resolution: server overwrites local
    if (JSON.stringify(serverQuotes) !== JSON.stringify(quotes)) {
      quotes = serverQuotes;
      saveQuotes();
      loadCategories();
      showNotification("Quotes updated from server (server version used).");
    }
  } catch (err) {
    console.error("Error fetching server data:", err);
  }
}

// Post to server
async function postToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" }
    });
    console.log("Quote synced with server:", quote);
  } catch (err) {
    console.error("Error posting to server:", err);
  }
}

// ---------------- UI Logic ----------------
function loadCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = categories
    .map(c => `<option value="${c}">${c}</option>`)
    .join("");
}

function showRandomQuote() {
  const category = categorySelect.value;
  const filtered = quotes.filter(q => q.category === category);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = random.text;
}

function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 5000);
}

// ---------------- Event Listeners ----------------
newQuoteBtn.addEventListener("click", showRandomQuote);

quoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newQuote = {
    text: quoteTextInput.value,
    category: quoteCategoryInput.value
  };
  quotes.push(newQuote);
  saveQuotes();
  loadCategories();
  postToServer(newQuote);
  quoteForm.reset();
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener("change", (event) => {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    loadCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
});

// ---------------- Initialize ----------------
loadQuotes();
loadCategories();
fetchQuotesFromServer();

// Periodic sync every 10s
setInterval(fetchQuotesFromServer, 10000);