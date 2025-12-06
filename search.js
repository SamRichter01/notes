/**
 * /search/script.js
 * Sam Richter
 * 12/6/25
 */

const searchBar = document.getElementById('searchBar');

searchBar.placeholder = 'Search';

searchBar.addEventListener('input', () => {
    console.log(searchBar.value);
});