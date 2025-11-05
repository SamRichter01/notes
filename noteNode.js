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
    
    constructor (type, content, name) {
        this.type = type;
        this.content = content;
        this.name = name;
        this.creationDate = Date.now();
        this.children = [];
    }


}