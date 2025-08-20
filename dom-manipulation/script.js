// Grab elements from HTML
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const quoteDisplay = document.getElementById("quoteDisplay");
const quoteForm = document.getElementById("quoteForm");
const quoteTextInput = document.getElementById("quoteText");
const quoteCategoryInput = document.getElementById("quoteCategory");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

// Load quotes from localStorage or start fresh
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load categories into dropdown
function loadCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

// Show random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length > 0) {
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = random.text;

    // Save last viewed quote in sessionStorage
    sessionStorage.setItem("lastQuote", random.text);
  } else {
    quoteDisplay.textContent = "No quotes in this category.";
  }
}

// Add new quote
quoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newQuote = {
    text: quoteTextInput.value,
    category: quoteCategoryInput.value
  };
  quotes.push(newQuote);
  saveQuotes();
  loadCategories();
  quoteForm.reset();
});

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    loadCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// Load categories on page load
loadCategories();

// Restore last viewed quote if available
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  quoteDisplay.textContent = `Last viewed: ${lastQuote}`;
}