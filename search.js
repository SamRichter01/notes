/**
 * /search/script.js
 * Sam Richter
 * 12/6/25
 */

const searchBar = document.getElementById('searchBar');
let dropdown = document.getElementById('resultDropdown');

searchBar.placeholder = 'Search';

dropdown.id = 'resultDropdown';
//document.querySelector('header').append(dropdown);
dropdown.style.display = 'none';

searchBar.addEventListener('input', () => {
    generateSearchableArray();
    searchNaively(searchBar.value.toLowerCase());
    buildResultDropdown();
});

let searchArray = [];
let searchMatches = [];

function generateSearchableArray() {
    searchArray = [];
    searchArray = createSearchableArrayRecursively(root, searchArray);
}

function createSearchableArrayRecursively(node, arr) {
    const temp = document.createElement('div');
    temp.innerHTML = node.content;

    let searchable = {
        'name': node.name,
        'content': node.content,
        'matchType': null,
        'node': node,
        'matchSnippet': null
    };

    arr.push(searchable);
    for (const child of node.children) {
        createSearchableArrayRecursively(child, arr);
    }
    return arr;
}

function searchNaively(searchString) {
    searchMatches = [];
    if (searchString === '') {
        return;
    }
    for (const candidate of searchArray) {
        const name = candidate.name.toLowerCase();
        const content = candidate.content;
        if (name.includes(searchString)) {
            candidate.matchType = 'name';
            searchMatches.push(candidate);
        }
        if (searchNoteContent(candidate, searchString)) {
            candidate.matchType = 'content';
            searchMatches.push(candidate);
        }
    }
}

function searchNoteContent(candidate, searchString) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = candidate.content;
    const candidateText = tempElement.textContent;
    let searchResult = candidateText.search(searchString);
    if (searchResult !== -1) {
        if (searchResult - 5 > 0) {
            candidate.matchSnippet = '...';
        }
        candidate.matchSnippet += candidateText.substring(searchResult - 5, searchResult + 5);
        if (searchResult !== candidateText.length) {
            candidate.matchSnippet += '...';
        }
        return true;
    }
    return false;
}

function buildResultDropdown() {
    dropdown.style.display = 'inline-block';
    const list =  document.getElementById('dropdownList');
    list.replaceChildren();
    for (const result of searchMatches) {
        let li = document.createElement('li');
        li.node = result.node;
        let htmlString = `<h4>${result.name}</h4>`;
        if (result.matchType === 'content') {
            htmlString += `<p><em>${result.matchSnippet}</em></p>`;
        }
        li.innerHTML = htmlString;
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedNodeBuffer = [li.node];
            currentNote = li.node;
            searchMatches = [];
            searchBar.value = '';
            buildResultDropdown();
            buildFileTree();
            resetEditor();
        });
        list.appendChild(li);
    }
}