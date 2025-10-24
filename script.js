/**
 * /notes/script.js
 * Sam Richter
 * 10/23/25
 */

const KEY_SAVEDATA = 'note';

/**
 * Parentheses around the function denote is as an Immediately Invoked Function Expression (IIFE)
 * This means that it runs as soon as it's defined. Commonly used for initialization.
 */
(function init(){
    const edit = document.querySelector('#edit');
    edit.contentWindow.document.querySelector('body').innerHtml = "Hello!";
    // Set the document within #edit to be editable
    edit.contentWindow.document.designMode = 'on';
})();

/**
 * Defunct code from when I demonstrated localstorage using just a textArea.
 * 
// Restore data from localStorage
(function restore() {
    let saveData = JSON.parse(localStorage.getItem(KEY_SAVEDATA)) ?? '';
    edit.textContent = saveData;
})();

noteBox.addEventListener('input', () => {
    let noteContent = edit.value;
    localStorage.setItem(KEY_SAVEDATA, JSON.stringify(noteContent));
    delete(noteContent);
});
*/