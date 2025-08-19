const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

const app = document.getElementById("app");

// ===== Create UI Elements Dynamically =====
function createUI() {
  // Title
  const title = document.createElement("h1");
  title.textContent = "Dynamic Quote Generator";
  app.appendChild(title);

  // Category Label + Select
  const label = document.createElement("label");
  label.setAttribute("for", "category");
  label.textContent = "Choose Category: ";
  app.appendChild(label);

  const categorySelect = document.createElement("select");
  categorySelect.id = "category";
  app.appendChild(categorySelect);

  // Quote Box
  const quoteBox = document.createElement("div");
  quoteBox.id = "quote-box";
  quoteBox.textContent = "Select a category to see a quote";
  app.appendChild(quoteBox);

  // Button
  const newQuoteBtn = document.createElement("button");
  newQuoteBtn.id = "new-quote";
  newQuoteBtn.textContent = "Show Random Quote";
  app.appendChild(newQuoteBtn);

  // Add Quote Section
  const subTitle = document.createElement("h2");
  subTitle.textContent = "Add New Quote";
  app.appendChild(subTitle);

  createAddQuoteForm(app, categorySelect);

  // Event for Show Random Quote
  newQuoteBtn.addEventListener("click", () => {
    showRandomQuote(categorySelect, quoteBox);
  });

  // Load categories initially
  loadCategories(categorySelect);
}

// ===== Load Categories into Dropdown =====
function loadCategories(selectElement) {
  const categories = [...new Set(quotes.map(q => q.category))];
  selectElement.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

// ===== Show Random Quote =====
function showRandomQuote(selectElement, quoteBox) {
  const selectedCategory = selectElement.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteBox.textContent = filteredQuotes[randomIndex].text;
  } else {
    quoteBox.textContent = "No quotes available in this category.";
  }
}

// ===== Create Add Quote Form Dynamically =====
function createAddQuoteForm(container, categorySelect) {
  const form = document.createElement("form");
  form.id = "quote-form";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "quote-text";
  quoteInput.placeholder = "Enter quote";
  quoteInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "quote-category";
  categoryInput.placeholder = "Enter category";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Quote";

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);
  container.appendChild(form);

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newQuote = {
      text: quoteInput.value,
      category: categoryInput.value
    };
    quotes.push(newQuote);
    loadCategories(categorySelect); // Refresh dropdown
    form.reset();
  });
}

// ===== Initialize App =====
createUI();