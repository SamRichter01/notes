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

// Editing iframe and its sub-elements
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

// Buffer for the node currently being dragged
let selectedNodeBuffer = [];
let dragBuffer = [];
let lastSelected = null;

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

    li.note = node;

    li.className = node.type;

    // If the list element is the currently selected one, bold it
    if (selectedNodeBuffer.findIndex(node => node.note === li.note) !== -1) {
        li.className = li.className.concat(' selected');
    } else {
        li.className = li.className.concat(' nonSelected');
    }

    // Select note code
    li.addEventListener('click', (event) => {
        event.stopPropagation();

        if (lastSelected !== null && event.shiftKey) {
            // Get every element in the file explorer.
            let allFiles = getSubFiles(fileList, []).filter(node => node.tagName === 'LI');
            let start = allFiles.findIndex(node => node.note === lastSelected.note);
            let end = allFiles.indexOf(event.target);
            if (start > end) {
                let temp = end;
                end = start;
                start = temp;
            }
            selectedNodeBuffer = allFiles.slice(start, end + 1);

            /**
             * Concatenate the two arrays without duplicates can allow for multiple selection ranges.
             * Problematically, a naive implemetation just makes everything get selected without overwriting.
             * I hope to think of a simple solution later.
             * 
             * https://medium.com/@rivoltafilippo/javascript-merge-arrays-without-duplicates-3fbd8f4881be
             * 
             * const newRange = allFiles.slice(start, end + 1);
             * selectedNodeBuffer = [...new Set([...selectedNodeBuffer, ...newRange])]
            */ 
            
        } else if (lastSelected !== null && event.ctrlKey) {
            let index = selectedNodeBuffer.findIndex(node => node.note === event.target.note);
            if (index > -1) {
                selectedNodeBuffer.splice(index, 1);
            } else {
                selectedNodeBuffer.push(event.target);
            }
            lastSelected = event.target;
        } else {
             // Clicking between two list items returns the list as a target, so in that case we want to deselect everything.
            if (event.target.tagName !== 'LI') {
                selectedNodeBuffer = [];
                lastSelected = null;
                currentNote = root;
            } else {
                selectedNodeBuffer = [event.target];
                lastSelected = event.target;
                currentNote = event.target.note;
            }
        }
       
        buildFileTree();
        resetEditor();
    });

    /**
    * Drag and drop code
    */
    li.draggable = 'true';

    li.addEventListener('dragstart', (event) => {
        
        event.stopPropagation();

        // Only allow a move operation and update the cursor to reflect that
        event.dataTransfer.effectAllowed = "move";

        // Insert the note being dragged into the buffer
        if (selectedNodeBuffer.findIndex(node => node.note === event.target.note) > -1 && selectedNodeBuffer.length > 1) {
            dragBuffer = grabRecursively(root, selectedNodeBuffer, []);
        } else {
            dragBuffer.push(event.target.note);
        }
    });

    // Cancel dragover so that drop can fire
    li.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    li.addEventListener('drop', (event) => {
        event.stopPropagation();

        if (selectedNodeBuffer.findIndex(node => node.note === event.target.note) > -1 || event.target.note.type === NOTE) {
            dragBuffer = [];
            return;
        }

        for (const note of dragBuffer) {
            deleteRecursively(root, note.creationDate);
        }

        event.target.note.children.push(...dragBuffer);

        selectedNodeBuffer = [];
        dragBuffer = [];
        lastSelected = null;

        buildFileTree();    
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

function grabRecursively(node, buffer, newBuffer) {
    for (const child of node.children) {
        if (buffer.findIndex(node => node.note === child) > -1) {
            newBuffer.push(child);
            continue;
        }
        grabRecursively(child, buffer, newBuffer);
    }
    return newBuffer;
}

/**
 * Event listeners for the root folder 
 */
fileList.addEventListener("dragover", (event) => {
    event.preventDefault();
});

fileList.addEventListener('drop', (event) => {
    event.stopPropagation();

    console.log(dragBuffer);
    for (const note of dragBuffer) {
        deleteRecursively(root, note.creationDate);
    }

    root.children.push(...dragBuffer);

    selectedNodeBuffer = [];
    dragBuffer = [];
    lastSelected = null;

    buildFileTree();    
});

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

function getSubFiles(node, arr) {
    arr.push(node);
    for (child of Array.from(node.childNodes)) {
        arr = getSubFiles(child, arr);
    }
    return arr;
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
            n.disabled = true;
            b.disabled = false;
        } else if (currentNote.type === FOLDER) {
            e.style.display = 'none'
            f.disabled = false;
            n.disabled = false;
            b.disabled = true;
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
    if (currentNote.type === NOTE) {
        return;
    }
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
    let deleteBuffer = grabRecursively(root, selectedNodeBuffer, []);
    for (const note of deleteBuffer) {
        deleteRecursively(root, note.creationDate);
    } 
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
    lastSelected = null;
    selectedNodeBuffer = [];
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