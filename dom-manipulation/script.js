let quotes = [
  { id: 1, text: "Believe in yourself and all that you are.", category: "Inspiration" },
  { id: 2, text: "Push yourself, because no one else is going to do it for you.", category: "Inspiration" },
  { id: 3, text: "I'm on a seafood diet. I see food and I eat it.", category: "Humor" },
  { id: 4, text: "Why don’t skeletons fight each other? They don’t have the guts.", category: "Humor" }
];

let categories = [];
let nextId = 5; // For local quote IDs

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const quoteList = document.getElementById("quoteList");
const syncStatus = document.getElementById("syncStatus");

function loadData() {
  const storedQuotes = localStorage.getItem("quotes");
  const storedCategories = localStorage.getItem("categories");

  if (storedQuotes) quotes = JSON.parse(storedQuotes);
  if (storedCategories) categories = JSON.parse(storedCategories);
  else categories = [...new Set(quotes.map(q => q.category))];

  if (quotes.length > 0) nextId = Math.max(...quotes.map(q => q.id)) + 1;
}

function saveData() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  localStorage.setItem("categories", JSON.stringify(categories));
}

function populateCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.sort();
  categories.forEach(function(category) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory && (categories.includes(lastCategory) || lastCategory === "all")) {
    categoryFilter.value = lastCategory;
  }
  filterQuotes();
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(function(q){ return q.category === selectedCategory; });
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;

  sessionStorage.setItem("lastQuote", filteredQuotes[randomIndex].text);
}

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { id: nextId++, text: text, category: category };
  quotes.push(newQuote);

  if (!categories.includes(category)) categories.push(category);

  saveData();
  populateCategories();
  updateQuoteList();

  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert("Quote added successfully!");
}

// Filter & persist
function filterQuotes() {
  localStorage.setItem("lastCategory", categoryFilter.value);
  showRandomQuote();
  updateQuoteList();
}

function updateQuoteList() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(function(q){ return q.category === selectedCategory; });
  }

  quoteList.innerHTML = "";
  filteredQuotes.forEach(function(q){
    const div = document.createElement("div");
    div.textContent = `[${q.category}] ${q.text}`;
    quoteList.appendChild(div);
  });
}

// JSON import/export (unchanged)
function exportToJsonFile() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        importedQuotes.forEach(function(q){
          if (!quotes.some(existing => existing.id === q.id)) {
            quotes.push(q);
            if (!categories.includes(q.category)) categories.push(q.category);
          }
        });
        saveData();
        populateCategories();
        updateQuoteList();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- Server Sync Simulation --------------------
// Using JSONPlaceholder (mock API)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    // Simulate mapping posts to quotes
    const serverQuotes = data.slice(0,5).map((post, index) => ({
      id: 1000 + index,
      text: post.title,
      category: "Server"
    }));

    let updated = false;

    serverQuotes.forEach(function(sq){
      if (!quotes.some(q => q.id === sq.id)) {
        quotes.push(sq);
        if (!categories.includes(sq.category)) categories.push(sq.category);
        updated = true;
      }
    });

    if (updated) {
      saveData();
      populateCategories();
      updateQuoteList();
      syncStatus.textContent = "Sync Status: Data updated from server!";
      setTimeout(() => { syncStatus.textContent = "Sync Status: Idle"; }, 3000);
    }

  } catch (err) {
    syncStatus.textContent = "Sync Status: Error fetching server data";
    console.error(err);
  }
}

// Periodic sync every 30 seconds
setInterval(fetchServerQuotes, 30000);

// -------------------- Initialize --------------------
loadData();
populateCategories();
updateQuoteList();
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) quoteDisplay.textContent = lastQuote;
fetchServerQuotes(); // Initial sync