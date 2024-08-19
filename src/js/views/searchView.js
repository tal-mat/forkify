class SearchView {
  _parentElement = document.querySelector('.search');

  // Retrieves the search query entered by the user and clears the input field.
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  // Clears the search input field after retrieving the query.
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  //  Adds an event handler for the search form submission, triggering the provided handler function.
  addHandlerSearch(handler) {
    // Attach an event listener to the form element, ensuring it responds to both button clicks and Enter key presses
    this._parentElement.addEventListener('submit', function (e) {
      // Prevent the default form submission behavior to avoid page reloads
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
