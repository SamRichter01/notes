/**
 * /notes/modules/noteNode.js
 * Sam Richter
 * 11/3/25
 */

/**
 * The class noteNode represents a node in the note file tree.
 * It contains the following public fields:
 * content      :   String
 * creationDate :   Date
 * parentNode   :   noteNode (nullable)
 * children     :   Array
 */
class noteNode {
    
    constructor (content, name, parentNode, layer) {
        // Ignore parentNode because I don't need to do a whole tree thing yet.
        //this.parentNode = parentNode;
        this.content = content;
        this.name = name;
        this.creationDate = Date.now();
        this.children = [];
        this.layer = layer;
    }


}