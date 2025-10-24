/**
 * /notes/script.js
 * Sam Richter
 * 10/23/25
 */

const KEY_SAVEDATA = 'note';

const e = document.getElementById('edit');
let win = e.contentWindow;
let doc = win.document;
const b = document.getElementById('boldBtn');
const i = document.getElementById('italicsBtn');
const u = document.getElementById('underlineBtn');
const s = document.getElementById('saveBtn')

/**
 * Parentheses around the function denote is as an Immediately Invoked Function Expression (IIFE)
 * This means that it runs as soon as it's defined. Commonly used for initialization.
 */
(function init(){
    // Set the document within #edit to be editable
    doc.designMode = 'on';

    // The document can be written to using the string form of the html we grabbed with the save button
    let saveData = JSON.parse(localStorage.getItem(KEY_SAVEDATA)) ?? '';
    doc.open();
    doc.write(saveData);
    doc.close();
})();

// Save button
s.addEventListener('click', () => {
    /**
     * Grab the outerHTML from the document as a string and send it to localStorage.
     * This is apparently a potential XSS vector so I'll probably have to implement sanitation.
     * See this link for more: https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
    */
    localStorage.setItem(KEY_SAVEDATA, JSON.stringify(doc.body.outerHTML));
});
