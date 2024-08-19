import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

// Transforms raw recipe data into a structured recipe object with relevant properties.
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    // Adds 'key' if it exists in the raw data when the user creates his own recipe
    ...(recipe.key && { key: recipe.key }),
  };
};

// Loads a specific recipe by its ID and updates the state with the recipe details.
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    // Sets the recipe as bookmarked if its ID is in bookmarks
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    // Temporary error handling
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

// Loads search results based on the provided query and updates the state with the results.
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        // Adds 'key' if it exists in the raw data when the user creates his own recipe
        ...(rec.key && { key: rec.key }),
      };
    });

    // Initialize current page of results back to 1
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

// Retrieves a specific page of search results based on the current state and pagination settings.
export const getSearchResultsPage = function (page = state.search.page) {
  // Update the current page number in the state with the provided page.
  state.search.page = page;

  // Calculate the start and end indices for slicing the search results
  // (e.g., for page 1: start = 0, end = 9; for page 2: start = 10, end = 19).
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

// Adjusts ingredient quantities and updates the servings prop in the state based on the new number of servings.
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // The formula: new quantity = (old quantity * new servings) / old servings
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

// Persists the bookmarks' array to localStorage.
const _persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// Adds a recipe to bookmarks and updates current recipe's bookmark status if needed.
export const addBookmark = function (recipe) {
  // Add bookmark if valid
  if (!recipe || state.bookmarks.some(bookmark => bookmark.id === recipe.id))
    return;
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  _persistBookmarks();
};

// Removes a bookmark from the bookmark array by ID and updates the current recipe's bookmarked status.
export const deleteBookmark = function (id) {
  // Delete the recipe from the bookmarks arr
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  if (index !== -1) {
    state.bookmarks.splice(index, 1);
  }

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  _persistBookmarks();
};

// Loads bookmarks from localStorage and updates the state.
const _init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

// Removes the bookmarks from localStorage
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// Uploads a new recipe by formatting ingredients and sending the data to the API.
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format.',
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

_init();
