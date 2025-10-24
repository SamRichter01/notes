/**
 * /notes/script.js
 * Sam Richter
 * 10/23/25
 */

const KEY_SAVEDATA = 'note'

const noteBox = document.querySelector('#noteBox');

// Restore data from localStorage
(function restore() {
    let saveData = JSON.parse(localStorage.getItem(KEY_SAVEDATA)) ?? '';
    noteBox.textContent = saveData;
})();

noteBox.addEventListener('input', () => {
    let noteContent = noteBox.value;
    localStorage.setItem(KEY_SAVEDATA, JSON.stringify(noteContent));
    delete(noteContent);
});