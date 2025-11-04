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
const n = document.getElementById('newBtn');
const d = document.getElementById('deleteBtn');
const t = document.getElementById('titleInput');
const fileList = document.getElementById('fileList');

// Root node for the file tree
let root = new noteNode('', 'Untitled Note', null);
let currentNote;

/**
 * Disable non-functional buttons
 */
b.disabled = true;
i.disabled = true;
u.disabled = true;

/**
 * Parentheses around the function denote is as an Immediately Invoked Function Expression (IIFE)
 * This means that it runs as soon as it's defined. Used for initialization.
 */
(function init(){
    // Set the document within #edit to be editable
    doc.designMode = 'on';

    // Retrieve the saved data
    retrieveSaveData();

    // Build the file tree
    buildFileTree();
})();

/**
 * Load saved data from localStorage
 * Check if 
 */ 
function retrieveSaveData () {
    
    // The document can be written to using the string form of the html we grabbed with the save button
    root = JSON.parse(localStorage.getItem(KEY_SAVEDATA)) ?? new noteNode('', 'Untitled Note', null, 0);
    //root = new noteNode('', 'Untitled Note', null, 0)
    currentNote = root;
    resetEditor(root);
}

// Build the file tree.
function buildFileTree() {
    fileList.replaceChildren();
    buildRecursively(root);
}

// Build the file tree children recursively
function buildRecursively (node) {
    let li = document.createElement('li');

    let indentations = '';
    for (let i = 0; i < node.layer; i++) {
        indentations = indentations.concat('| ');
    }
    
    li.append(indentations.concat(node.name));
    li.setAttribute('timestamp', node.creationDate);

    li.addEventListener('click', (e) => {
        saveNote();
        findRecursively(root, parseInt(e.target.getAttribute('timestamp')));
        resetEditor();
        fileList.childNodes.forEach((node) => {
            node.style.fontWeight = 'normal';
        });
        e.target.style.fontWeight = 'bold';
    });

    fileList.appendChild(li);
    
    node.children.forEach((node) => {
        buildRecursively(node);
    });
}

function findRecursively(node, timestamp) {
    if (node.creationDate === timestamp) {
        currentNote = node;
    } else {
        node.children.forEach((childNode) => {
            return findRecursively(childNode, timestamp);
        });
    }
}

function resetEditor () {
    doc.open();
    doc.write(currentNote.content);
    doc.close();
    t.value = currentNote.name;
}

function saveNote () {
    /**
     * Grab the outerHTML from the document as a string and save it to the currentNote.
     * This is apparently a potential XSS vector so I'll probably have to implement sanitation.
     * See this link for more: https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
     * 
     * Save the root node to localStorage
    */
    currentNote.name = t.value;
    currentNote.content = doc.body.outerHTML;
    localStorage.setItem(KEY_SAVEDATA, JSON.stringify(root));
}



// New Note Button
n.addEventListener('click', () => {
    saveNote();
    
    let newNote = new noteNode('', 'Untitled Note', currentNote, currentNote.layer + 1);
    currentNote.children.push(newNote);
    currentNote = newNote;

    resetEditor(currentNote);

    saveNote();

    buildFileTree();
});

// Save button
s.addEventListener('click', () => {
    saveNote();
    buildFileTree();
});

// Bold button
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