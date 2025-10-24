/**
 * /notes/script.js
 * Sam Richter
 * 10/23/25
 */
const KEY_SAVEDATA = 'note';

const TEXT_NODE = '#text';

const e = document.getElementById('edit');
let win = e.contentWindow;
let doc = win.document;
const b = document.getElementById('boldBtn');
const i = document.getElementById('italicsBtn');
const u = document.getElementById('underlineBtn');
const s = document.getElementById('saveBtn');

/**
 * Parentheses around the function denote is as an Immediately Invoked Function Expression (IIFE)
 * This means that it runs as soon as it's defined. Used for initialization.
 */
(function init(){
    // Set the document within #edit to be editable
    doc.designMode = 'on';

    // Load saved data from localStorage
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

// Bold button
/**
selection = win.getSelection();  

if selection.isCollapsed {  
    // Nothing is selected so there's nothing to bold. Return.  
}  

// Get the first (and probably only) range in the selection. 
range = selection.getRangeAt(0) 

Loop through the nodes in top container {

    If the node is a text node {

        Create a new range with the start of the text node
    } 
}
*/
b.addEventListener('click', () => {
    
    // Get the Range object from the selection
    const sel = win.getSelection().getRangeAt(0);

    // Get the highest container that contains the range
    const topContainer = sel.commonAncestorContainer.childNodes;
    console.log(sel.commonAncestorContainer);

    // If the range spans only one text node, wrap the text in a <b> tag
    if (sel.startContainer.nodeName === TEXT_NODE && topContainer.length === 0) {
        sel.surroundContents(document.createElement('b'));
    } else {
        boldRecursively(sel.commonAncestorContainer);
    }
});

function boldRecursively (node) {
    console.log(node);
    if (node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
            i++;
            boldRecursively(node.childNodes[i - 1]);
        }
    }
    if (node.nodeName === TEXT_NODE) {
        let range = document.createRange();
        range.setStart(node, 0);
        range.setEnd(node, node.length - 1);
        range.surroundContents(document.createElement('b'));
    }
    return;
}