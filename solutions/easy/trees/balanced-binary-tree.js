/**
 * Problem: Balanced Binary Tree
 * Link: https://leetcode.com/problems/balanced-binary-tree/
 * Difficulty: Easy
 *
 * A height-balanced tree: depth of two subtrees of every node differ by at most 1.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution - Bottom-up DFS
function isBalanced(root) {
  function height(node) {
    if (!node) return 0;
    
    const left = height(node.left);
    if (left === -1) return -1; // left subtree unbalanced
    
    const right = height(node.right);
    if (right === -1) return -1; // right subtree unbalanced
    
    if (Math.abs(left - right) > 1) return -1; // current node unbalanced
    
    return Math.max(left, right) + 1;
  }

  return height(root) !== -1;
}

module.exports = isBalanced;

/* Python Solution:

def isBalanced(root):
    def height(node):
        if not node: return 0
        
        left = height(node.left)
        if left == -1: return -1
        
        right = height(node.right)
        if right == -1: return -1
        
        if abs(left - right) > 1: return -1
        
        return max(left, right) + 1
    
    return height(root) != -1

*/
