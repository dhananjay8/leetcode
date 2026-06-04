/**
 * // Definition for a QuadTree node.
 * function Node(val,isLeaf,topLeft,topRight,bottomLeft,bottomRight) {
 *    this.val = val;
 *    this.isLeaf = isLeaf;
 *    this.topLeft = topLeft;
 *    this.topRight = topRight;
 *    this.bottomLeft = bottomLeft;
 *    this.bottomRight = bottomRight;
 * };
 */

/**
 * @param {number[][]} grid
 * @return {Node}
 */
var construct = function(grid) {
    // Helper function to check if all values in the grid are the same
    function isUniform(row, col, size) {
        const value = grid[row][col];
        for (let i = row; i < row + size; i++) {
            for (let j = col; j < col + size; j++) {
                if (grid[i][j] !== value) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Recursive function to build the quad tree
    function build(row, col, size) {
        // Base case: if the current grid is uniform, create a leaf node
        if (isUniform(row, col, size)) {
            return new Node(grid[row][col], true, null, null, null, null);
        }
        
        // If not uniform, divide the grid into 4 quadrants
        const halfSize = Math.floor(size / 2);
        
        // Recursively build each quadrant
        const topLeft = build(row, col, halfSize);
        const topRight = build(row, col + halfSize, halfSize);
        const bottomLeft = build(row + halfSize, col, halfSize);
        const bottomRight = build(row + halfSize, col + halfSize, halfSize);
        
        // Create a non-leaf node (val can be any value, typically 1)
        return new Node(1, false, topLeft, topRight, bottomLeft, bottomRight);
    }
    
    // Start building from the entire grid
    return build(0, 0, grid.length);
};

// Test helper function to print tree structure
function printTree(node, level = 0) {
    if (!node) return;
    const indent = '  '.repeat(level);
    console.log(indent + `val: ${node.val}, isLeaf: ${node.isLeaf}`);
    if (!node.isLeaf) {
        printTree(node.topLeft, level + 1);
        printTree(node.topRight, level + 1);
        printTree(node.bottomLeft, level + 1);
        printTree(node.bottomRight, level + 1);
    }
}

// Test cases
const grid1 = [
    [0,1],
    [1,0]
];
const tree1 = construct(grid1);
printTree(tree1);

const grid2 = [
    [0,1],
    [1,1]
];
const tree2 = construct(grid2);
printTree(tree2);
