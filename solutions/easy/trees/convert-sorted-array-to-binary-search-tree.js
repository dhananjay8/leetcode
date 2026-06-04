/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {number[]} nums
 * @return {TreeNode}
 */
var sortedArrayToBST = function(nums) {
    // Base case: if array is empty, return null
    if (!nums || nums.length === 0) return null;
    
    // Helper function to build BST from array segment
    function buildBST(left, right) {
        // Base case: if left > right, no elements to process
        if (left > right) return null;
        
        // Find middle element to ensure balanced tree
        const mid = Math.floor((left + right) / 2);
        
        // Create root node with middle element
        const root = new TreeNode(nums[mid]);
        
        // Recursively build left and right subtrees
        root.left = buildBST(left, mid - 1);
        root.right = buildBST(mid + 1, right);
        
        return root;
    }
    
    // Build BST from entire array
    return buildBST(0, nums.length - 1);
};

// Test helper function to convert tree to array for verification
function treeToArray(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const node = queue.shift();
        if (node) {
            result.push(node.val);
            queue.push(node.left, node.right);
        } else {
            result.push(null);
        }
    }
    
    // Remove trailing nulls
    while (result.length > 0 && result[result.length - 1] === null) {
        result.pop();
    }
    
    return result;
}

// Test cases
console.log(treeToArray(sortedArrayToBST([-10,-3,0,5,9]))); // [0,-3,9,-10,null,5]
console.log(treeToArray(sortedArrayToBST([1,3]))); // [3,1]
