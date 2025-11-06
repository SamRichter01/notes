/**
 * /notes/script.js
 * Sam Richter
 * 10/23/25
 */
const KEY_SAVEDATA = 'note';

const TEXT_NODE = '#text';
const BOLD_NODE = 'B';

const FOLDER = 'folder';
const NOTE = 'note';
const BUCKET = 'bucket';

const e = document.getElementById('edit');
let win = e.contentWindow;
let doc = win.document;
const b = document.getElementById('boldBtn');
const i = document.getElementById('italicsBtn');
const u = document.getElementById('underlineBtn');
const s = document.getElementById('saveBtn');
const n = document.getElementById('newBtn');
const f = document.getElementById('newFolderBtn');
const d = document.getElementById('deleteBtn');
const t = document.getElementById('titleInput');
const fileList = document.getElementById('fileList');
let fileBox = document.getElementById('fileBox');
const date = document.getElementById('createdDate');

// Root node for the file tree
let root;
let currentNote;

/**
 * Disable non-functional buttons
 */
b.disabled = true;
i.disabled = true;
u.disabled = true;
// The save button is disabled now that I've implemented autosaving.
s.disabled = true;

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
    root = JSON.parse(localStorage.getItem(KEY_SAVEDATA)) ?? new noteNode(BUCKET, '', '');
    currentNote = root;
    resetEditor();
}

// Build the file tree.
function buildFileTree() {
    fileList.replaceChildren();
    for (node of root.children) {
        fileList.append(buildRecursively(node));
    }
}

// Build the file tree children recursively
function buildRecursively (node) {

     // Create a new list element for the file navigator
    let li = document.createElement('li');

    // Sets the text of the node to be its name
    li.textContent = node.name;

    // Attach the note's timestamp to the list element to identify the element as belonging to that note
    li.setAttribute('timestamp', node.creationDate);

    li.className = node.type;

    // If the list element is the currently selected one, bold it
    if (parseInt(li.getAttribute('timestamp')) === currentNote.creationDate) {
        li.className = li.className.concat(' selected');
    } else {
        li.className = li.className.concat(' nonSelected');
    }

    // Select note code
    li.addEventListener('click', (e) => {
        e.stopPropagation();
        save();
        findRecursively(root, parseInt(e.target.getAttribute('timestamp')));
        buildFileTree();
        resetEditor();
    });

    // Check if the node has children
    if (node.children.length > 0) {
        // Create a new ul for the child notes to live in
        let ul = document.createElement('ul');
        // For every child node, append the result of buildRecursively()
        for (const childNode of node.children) {
            ul.append(buildRecursively(childNode));
        }
        // Add the ul to the original list item
        li.append(ul);
    }

    return li;
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

function deleteRecursively(node, timestamp) {
    let index = node.children.findIndex(childNode => childNode.creationDate === timestamp);
    if (index !== -1) {
        node.children.splice(index, 1);
        return node;
    }
    node.children.forEach((childNode) => {
        return deleteRecursively(childNode, timestamp);
    });
    return node;
}

/**
 * Grabbed from: https://stackoverflow.com/questions/8321874/how-to-get-all-childnodes-in-js-including-all-the-grandchildren
 * I've read up on how it works but couldn't replicate it myself.
 * I think it might be applicable to the list tree, but I don't have a use case for it yet.
*/
function getAllDescendants(node) {
    return (!node) ? [] : [...node.childNodes, ...Array.from(node.childNodes).flatMap(child => getAllDescendants(child))];
}


function resetEditor() {
    doc.open();
    if (currentNote.type === BUCKET) {
        e.style.display = 'none'
        d.disabled = true;
        t.disabled = true;
        f.disabled = false;
        date.hidden = true;
    } else {
        if (currentNote.type === NOTE) {
            doc.write(currentNote.content);
            e.style.display = 'initial'
            f.disabled = true;
        } else if (currentNote.type === FOLDER) {
            e.style.display = 'none'
            f.disabled = false;
        }
        d.disabled = false;
        t.disabled = false;
        date.hidden = false;
    } 
    doc.close();
    t.value = currentNote.name;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateValue = new Date();
    dateValue.value = currentNote.creationDate;
    date.textContent = ('Created: ').concat(dateValue.toLocaleString("en-US", options));
}

function save() {
    /**
     * Grab the outerHTML from the document as a string and save it to the currentNote.
     * This is apparently a potential XSS vector so I'll probably have to implement sanitation.
     * See this link for more: https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML
     * 
     * Save the root node to localStorage
    */
    if (currentNote.type === NOTE) {
        currentNote.content = doc.body.outerHTML;
    }
    currentNote.name = t.value;
    localStorage.setItem(KEY_SAVEDATA, JSON.stringify(root));
}


/**
 * Event listeners
 */

// New Note Button
n.addEventListener('click', () => {
    save();
    let newNote = new noteNode('note', '', 'Untitled Note');
    currentNote.children.push(newNote);
    currentNote = newNote;
    resetEditor();
    save();
    buildFileTree();
});

// New Folder Button
f.addEventListener('click', () => {
    if (currentNote.type === NOTE) {
        return;
    }
    save();
    let newFolder = new noteNode(FOLDER, '', 'Untitled Folder');
    currentNote.children.push(newFolder);
    currentNote = newFolder;
    resetEditor();
    save();
    buildFileTree();
});

// Save button
s.addEventListener('click', () => {
    save();
    buildFileTree();
});

// Delete Button
d.addEventListener('click', () => {
    currentNote = deleteRecursively(root, currentNote.creationDate);
    resetEditor();
    buildFileTree();
});

// Save on title change
t.addEventListener('input', () => {
    save();
    buildFileTree();
});

// Select root node when clicking outside of note list
fileBox.addEventListener('click', () => {
    currentNote = root;
    buildFileTree();
    resetEditor();
});


/**
 * Setting up a mutation observer to detect changes within the iframe's dom to autosave notes.
 */

// Select the node that will be observed for mutations
const targetNode = doc;

// Options for the observer (which mutations to observe)
const config = { characterData: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    save();
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);


/**
 * Rich text functions
 */

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