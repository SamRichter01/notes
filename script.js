/**
 * /notes/script.js
 * Sam Richter
 * 10/23/25
 */
const KEY_SAVEDATA = 'note';

const TEXT_NODE = '#text';
const BOLD_NODE = 'B';

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
        // Gather an array of all the text and bold nodes.
        let stack = [];
        stack = gatherNodes(sel, sel.commonAncestorContainer, stack).reverse()

        // Check to see if the array contains any text nodes. If it does, that means they need to be bolded.
        if(stack.some(node => node.nodeName === TEXT_NODE)) {
            makeStuffBold(sel, stack);
        } else {
            //makeStuffLessBold();
        }
    }
});

// Iterate over the selection recursively and return a stack that contains all of the affected nodes
function gatherNodes (startRange, node, stack) {

    // If the node is bold return immediately
    if (node.nodeName === BOLD_NODE) {
        stack.push(node);
        return stack;
    }
    
    // If the node has a sibling, check it.
    if (node.nextSibling !== null) {
        // Gather the nodes to the right of the current one.
        stack = gatherNodes(startRange, node.nextSibling, stack);
    }

    // Check the node's children
    if (node.firstChild !== null) {
        stack = gatherNodes(startRange, node.firstChild, stack);
    }

    // If the node is a text or bold node, push it to the stack.
    if (node.nodeName === TEXT_NODE) {
        stack.push(node);
    }
    return stack;
}

// Go through the stack and make everything bold.
function makeStuffBold (range, stack) {

    for (let i = 0; i < stack.length; i++) {
        let node = stack[i];
        
        // If the node is the front of the range, handle it separately.
        if (node === range.startContainer) {
            
            // Split the text node in twain
            let newNode = node.splitText(range.startOffset);

            // Create a new range around the new node so we can wrap it in a tag
            let newRange = document.createRange();
            newRange.setStartBefore(newNode);
            newRange.setEndAfter(newNode);

            // Wrap the node in a tag
            newRange.surroundContents(document.createElement(BOLD_NODE));

            continue;
        }

        // If the node is the end of the range, handle it separately.
        if (node === range.endContainer) {
            
            let text = node.wholeText;
            let newText = text.substring(0, range.endOffset);
            let secondText = text.substring(range.endOffset);
            let newNode = new Text(newText);
            let secondNode = new Text(secondText);

            let tempStart = range.startContainer;
            let tempStartOffset = range.startOffset;
            let tempEnd = range.endContainer;

            range.setStart(tempEnd, 0);
            range.setEndAfter(tempEnd);

            node.remove();

            range.insertNode(secondNode);
            range.insertNode(newNode);

            range.setStart(tempStart, tempStartOffset);
            
            // Create a new range around the new node so we can wrap it in a tag
            let newRange = document.createRange();
            newRange.setStartBefore(newNode);
            newRange.setEndAfter(newNode);

            // Wrap the node in a tag
            newRange.surroundContents(document.createElement(BOLD_NODE));

            continue;
        }

        // Ignore non-text nodes and nodes outside of the range. 
        if (node.nodeName !== TEXT_NODE || 
            range.comparePoint(node, 0) !== 0 || 
            range.comparePoint(node, node.wholeText.length) !== 0) {
            continue;
        }
        
        // Create a new range around the new node so we can wrap it in a tag
        let newRange = document.createRange();
        newRange.setStartBefore(node);
        newRange.setEndAfter(node);

        // Wrap the node in a tag
        newRange.surroundContents(document.createElement(BOLD_NODE));
    }

    // Wrap the node in a <b> tag.
}