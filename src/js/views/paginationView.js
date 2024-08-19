import View from './View';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  // Attaches an event listener to handle click events on pagination buttons.
  addHandlerClick(handler) {
    // Attach a single event listener to the parent element to handle clicks for both buttons.
    this._parentElement.addEventListener('click', function (e) {
      // Must using a function with event and not directly use handler to know which btn was clicked
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  // Generates the markup for pagination buttons based on the current page and total pages.
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage,
    );

    // Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return this._generateMarkupBtn('next');
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return this._generateMarkupBtn('prev');
    }

    // Another page
    if (curPage < numPages) {
      return `
        ${this._generateMarkupBtn('prev')}
        ${this._generateMarkupBtn('next')}
      `;
    }

    // Page 1, and there are No other pages
    if (curPage === 1 && numPages === 1) {
      return '';
    }
  }

  // Generates the markup for an individual pagination button (previous or next).
  _generateMarkupBtn(type) {
    const curPage = this._data.page;
    const goToPage = type === 'next' ? curPage + 1 : curPage - 1;
    return `
        <button data-goto="${goToPage}" class="btn--inline pagination__btn--${type}">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-${type === 'next' ? 'right' : 'left'}"></use>
            </svg>
            <span>Page ${goToPage}</span>
          </button>
      `;
  }
}

export default new PaginationView();
