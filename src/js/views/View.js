import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  // Renders the provided data to the DOM or returns an error if the data is invalid or empty.
  // The `render` parameter controls whether to insert the HTML into the DOM (`true`) or return it as a string (`false`).
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Updates the DOM by comparing and applying only necessary changes between the new and current markup.
  update(data) {
    this._data = data;

    // Generate new markup html str based on the provided data.
    const newMarkup = this._generateMarkup();

    // Create a DocumentFragment from the new markup for efficient DOM manipulation.
    const newDOM = document.createRange().createContextualFragment(newMarkup);

    // Convert the newly created DOM elements and the current elements into arrays.
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    // Iterate over the new elements to compare them with the current elements.
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      console.log(curEl, newEl.isEqualNode(curEl));

      // Update the text content of the current element if the nodes are not identical and the new element contains text (its type is the first child)
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Update the attributes of the current element if the nodes are not identical.
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value),
        );
      }
    });
  }

  // Clears the content of the parent element.
  _clear() {
    this._parentElement.innerHTML = '';
  }

  // Renders a loading spinner to the DOM to indicate that content is being loaded.
  renderSpinner() {
    const markup = `
    <div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>
  `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  //  Renders an error message to the DOM.
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Renders a success message to the DOM.
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
