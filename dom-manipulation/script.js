document.addEventListener('DOMContentLoaded', () => {
  let quotes = loadQuotes();

  // Simulated server URL
  const serverUrl = 'https://jsonplaceholder.typicode.com/posts';

  // Fetch quotes from the server
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(serverUrl);
      const serverQuotes = await response.json();
      resolveConflicts(serverQuotes);
      saveQuotes();
      displaySyncNotification(); // Notify user after syncing
    } catch (error) {
      console.error('Failed to fetch quotes from the server:', error);
    }
  }

  // Sync quotes with the server
  async function syncQuotes() {
    try {
      await fetchQuotesFromServer();
    } catch (error) {
      console.error('Failed to sync quotes:', error);
    }
  }

  // Post a new quote to the server
  async function postQuoteToServer(quote) {
    try {
      await fetch(serverUrl, {
        method: 'POST',
        body: JSON.stringify(quote),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to post quote to the server:', error);
    }
  }

  // Resolve conflicts between local quotes and server quotes
  function resolveConflicts(serverQuotes) {
    const localQuoteTexts = quotes.map(quote => quote.text);
    serverQuotes.forEach(serverQuote => {
      if (!localQuoteTexts.includes(serverQuote.text)) {
        quotes.push(serverQuote);
      }
    });
    displayConflictNotification();
  }

  // Display a notification when conflicts are resolved
  function displayConflictNotification() {
    const notification = document.createElement('div');
    notification.textContent = 'Data synced with the server. Conflicts resolved.';
    notification.style.color = 'green';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // Display a sync notification
  function displaySyncNotification() {
    const notification = document.createElement('div');
    notification.textContent = 'Quotes synced with server!';
    notification.style.color = 'blue';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  // Show a random quote
  function showRandomQuote() {
    const filteredQuotes = getFilteredQuotes();
    const quoteDisplay = document.getElementById('quoteDisplay');
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
  }

  // Create the form for adding a new quote
  function createAddQuoteForm() {
    const formContainer = document.createElement('div');

    const quoteInput = document.createElement('input');
    quoteInput.setAttribute('id', 'newQuoteText');
    quoteInput.setAttribute('type', 'text');
    quoteInput.setAttribute('placeholder', 'Enter a new quote');
    formContainer.appendChild(quoteInput);

    const categoryInput = document.createElement('input');
    categoryInput.setAttribute('id', 'newQuoteCategory');
    categoryInput.setAttribute('type', 'text');
    categoryInput.setAttribute('placeholder', 'Enter quote category');
    formContainer.appendChild(categoryInput);

    const addButton = document.createElement('button');
    addButton.setAttribute('id', 'addQuoteButton');
    addButton.textContent = 'Add Quote';
    formContainer.appendChild(addButton);

    document.body.appendChild(formContainer);

    addButton.addEventListener('click', addQuote);
  }

  // Add a new quote
  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
      const newQuote = { text: newQuoteText, category: newQuoteCategory };
      quotes.push(newQuote);
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
      saveQuotes();
      populateCategories();
      alert('Quote added successfully!');
      postQuoteToServer(newQuote);
    } else {
      alert('Please fill in both fields.');
    }
  }

  // Save quotes to local storage
  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  // Load quotes from local storage
  function loadQuotes() {
    const savedQuotes = localStorage.getItem('quotes');
    return savedQuotes ? JSON.parse(savedQuotes) : [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" }
      // Add more default quotes here
    ];
  }

  // Get unique categories from quotes
  function getUniqueCategories() {
    const categories = quotes.map(quote => quote.category);
    return [...new Set(categories)];
  }

  // Populate categories in the dropdown menu
  function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const uniqueCategories = getUniqueCategories();
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    uniqueCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    // Restore the last selected filter
    const lastSelectedCategory = localStorage.getItem('selectedCategory');
    if (lastSelectedCategory) {
      categoryFilter.value = lastSelectedCategory;
    }
  }

  // Filter quotes based on the selected category
  function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory);
    showRandomQuote();
  }

  // Get quotes filtered by the selected category
  function getFilteredQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    if (selectedCategory === 'all') {
      return quotes;
    }
    return quotes.filter(quote => quote.category === selectedCategory);
  }

  // Export quotes to a JSON file
  function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "quotes.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  }

  // Import quotes from a JSON file
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // Event listeners for buttons
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  document.getElementById('exportQuotes').addEventListener('click', exportQuotes);

  // Call createAddQuoteForm to add the form to the DOM
  createAddQuoteForm();

  // Load last viewed quote from session storage
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
    const quote = JSON.parse(lastViewedQuote);
    document.getElementById('quoteDisplay').innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
  }

  // Populate category filter and restore last selected filter
  populateCategories();

  // Filter quotes initially
  filterQuotes();

  // Fetch quotes from the server initially
  fetchQuotesFromServer();

  // Sync quotes with the server periodically
  setInterval(syncQuotes, 60000); // Sync every 60 seconds
});
