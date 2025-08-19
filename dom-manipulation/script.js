// Array of quote objects
 const quotes = [
      { text: "The best way to predict the future is to create it.", category: "Motivation" },
      { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
      { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
    ];

    const categorySelect = document.getElementById("category");
    const quoteBox = document.getElementById("quote-box");
    const newQuoteBtn = document.getElementById("new-quote");
    const quoteForm = document.getElementById("quote-form");
    const quoteTextInput = document.getElementById("quote-text");
    const quoteCategoryInput = document.getElementById("quote-category");

    // Load unique categories into dropdown
    function loadCategories() {
      const categories = [...new Set(quotes.map(q => q.category))];
      categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
    }

    // Show random quote from selected category
    function showRandomQuote() {
      const selectedCategory = categorySelect.value;
      const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
      if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        quoteBox.textContent = filteredQuotes[randomIndex].text;
      } else {
        quoteBox.textContent = "No quotes available in this category.";
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
      loadCategories(); // refresh categories
      quoteForm.reset();
    });

    newQuoteBtn.addEventListener("click", showRandomQuote);

    // Initialize categories
    loadCategories();