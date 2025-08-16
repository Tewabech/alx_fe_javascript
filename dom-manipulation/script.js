// Array of quote objects
var quotes = [
  { text: "Believe in yourself and all that you are.", category: "Inspiration" },
  { text: "Push yourself, because no one else is going to do it for you.", category: "Inspiration" },
  { text: "I'm on a seafood diet. I see food and I eat it.", category: "Humor" },
  { text: "Why don’t skeletons fight each other? They don’t have the guts.", category: "Humor" }
];

var quoteDisplay = document.getElementById("quoteDisplay");
var newQuoteText = document.getElementById("newQuoteText");
var newQuoteCategory = document.getElementById("newQuoteCategory");
var categorySelect = document.getElementById("categorySelect");

function populateCategories() {
  categorySelect.innerHTML = "";
  var categories = [];
  for (var i = 0; i < quotes.length; i++) {
    if (!categories.includes(quotes[i].category)) {
      categories.push(quotes[i].category);
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
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

function addQuote() {
  var text = newQuoteText.value.trim();
  var category = newQuoteCategory.value.trim();
  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }
  for (var i = 0; i < quotes.length; i++) {
    if (quotes[i].text.toLowerCase() === text.toLowerCase()) {
      alert("This quote already exists!");
      return;
    }
  }
  quotes.push({ text: text, category: category });
  var exists = false;
  for (var j = 0; j < categorySelect.options.length; j++) {
    if (categorySelect.options[j].value === category) {
      exists = true;
      break;
    }
  }
  if (!exists) {
    var newOption = document.createElement("option");
    newOption.value = category;
    newOption.textContent = category;
    categorySelect.appendChild(newOption);
  }
  newQuoteText.value = "";
  newQuoteCategory.value = "";
  alert("Quote added successfully!");
}

categorySelect.addEventListener("change", showRandomQuote);

populateCategories();