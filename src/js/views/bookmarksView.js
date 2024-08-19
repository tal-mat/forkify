import View from './View';
import previewView from './previewView';
import icons from 'url:../../img/icons.svg';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = `No bookmarks yet. Find a nice recipe and bookmark it.`;
  _message = '';

  // Registers a handler to be called when the window's load event is fired.
  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  // Generates HTML markup for the list of bookmarked recipes by mapping over the data and rendering each bookmark.
  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new BookmarksView();
