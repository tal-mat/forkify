import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import { state } from './model.js';

// // Enables Hot Module Replacement (HMR) to update modules without a full page reload.
// if (module.hot) {
//   module.hot.accept();
// }

// Control function for rendering a recipe
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    // 1) Render spinner while loading data
    recipeView.renderSpinner();

    // 2) Update results view to mark the selected search result
    resultsView.update(model.getSearchResultsPage());

    // 3) Update bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 4) Load recipe data based on the ID
    await model.loadRecipe(id);

    // 5) Render the recipe to the view
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

// Control function for handling search results
const controlSearchResults = async function () {
  try {
    // 1) Render spinner while loading data
    resultsView.renderSpinner();

    // 2) Get the search query from the view
    const query = searchView.getQuery();
    if (!query) return;

    // 3) Load search results based on the query
    await model.loadSearchResults(query);

    // 4) Render the results of the current page
    resultsView.render(model.getSearchResultsPage());

    // 5) Render initial pagination buttons for the search results
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// Control function for handling pagination
const controlPagination = function (goToPage) {
  // 1) Render the results for the specified page, the goToPage comes from the paginationView.addHandlerClick
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render updated pagination buttons for the current state
  paginationView.render(model.state.search);
};

// Updates recipe servings and refreshes the view
const controlServings = function (newServings) {
  // 1) Update the recipe servings (in state)
  model.updateServings(newServings);

  // 2) Update the recipe view
  recipeView.update(model.state.recipe);
};

// Toggles the current recipe's bookmark status and updates the view accordingly.
const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render the bookmarks
  bookmarksView.render(model.state.bookmarks);
};

// Renders the current bookmarks from the state to the bookmarks view
const controlBookmarks = function () {
  bookmarksView.render(state.bookmarks);
};

// // Manages the process of adding a new recipe, from showing the spinner to closing the form.
const controlAddRecipe = async function (newRecipe) {
  try {
    // 1) Show loading spinner
    addRecipeView.renderSpinner();

    // 2) Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // 3) Render recipe
    recipeView.render(model.state.recipe);

    // 4) Success message
    addRecipeView.renderMessage();

    // 5) Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // 6) Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 7) Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log('💥', err);
    addRecipeView.renderError(err.message);
  }
  location.reload();
};

// Initialize the application
const init = function () {
  // Registers the handler to update bookmarks view on load.
  bookmarksView.addHandlerRender(controlBookmarks);

  // Renders recipes on URL hash change
  recipeView.addHandlerRender(controlRecipes);

  // Renders when servings are updated/changed
  recipeView.addHandlerUpdateServings(controlServings);

  // Handles bookmark button clicks
  recipeView.addHandlerAddBookmark(controlAddBookmark);

  // Handles recipe searches
  searchView.addHandlerSearch(controlSearchResults);

  // Handles pagination button clicks
  paginationView.addHandlerClick(controlPagination);

  // Sets up the handler for uploading a new recipe by the user which will be private to him.
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

// Start the application
init();
