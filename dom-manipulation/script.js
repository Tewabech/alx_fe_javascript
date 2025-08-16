// Array of quote objects
let quotes = [
  { text: "Believe in yourself and all that you are.", category: "Inspiration" },
  { text: "Push yourself, because no one else is going to do it for you.", category: "Inspiration" },
  { text: "I'm on a seafood diet. I see food and I eat it.", category: "Humor" },
  { text: "Why don’t skeletons fight each other? They don’t have the guts.", category: "Humor" }
];

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categorySelect = document.getElementById("categorySelect");

// Populate categories dynamically
function populateCategories() {
  categorySelect.innerHTML = ""; // Clear old options

  // Get unique categories from quotes
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Show a random quote from selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;

  if (!selectedCategory) {
    quoteDisplay.textContent = "Please select a category.";
    return;
  }

  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Add a new quote dynamically
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add new quote to array
  quotes.push({ text, category });

  // If it's a new category, update dropdown
  if (![...categorySelect.options].some(opt => opt.value === category)) {
    const newOption = document.createElement("option");
    newOption.value = category;
    newOption.textContent = category;
    categorySelect.appendChild(newOption);
  }

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  alert("Quote added successfully!");
}

// Initial setup
populateCategories();