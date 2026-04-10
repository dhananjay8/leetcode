/**
 * Problem: Recover Binary Search Tree
 * Link: https://leetcode.com/problems/recover-binary-search-tree/
 * Difficulty: Medium
 *
 * Two nodes of a BST are swapped by mistake. Recover the tree without changing structure.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h) for recursion, O(1) with Morris traversal
 */

// JavaScript Solution - Inorder traversal to find swapped nodes
function recoverTree(root) {
  let first = null, second = null, prev = null;

  function inorder(node) {
    if (!node) return;
    
    inorder(node.left);
    
    // In correct BST, prev.val < node.val always
    // If prev.val > node.val, we found a violation
    if (prev && prev.val > node.val) {
      if (!first) first = prev; // first violation: prev is the bad node
      second = node;            // second (or only) violation: node is the bad node
    }
    prev = node;
    
    inorder(node.right);
  }

  inorder(root);
  
  // Swap values of the two misplaced nodes
  const temp = first.val;
  first.val = second.val;
  second.val = temp;
}

module.exports = recoverTree;

/* Python Solution:

def recoverTree(root):
    first = second = prev = None
    
    def inorder(node):
        nonlocal first, second, prev
        if not node: return
        
        inorder(node.left)
        
        if prev and prev.val > node.val:
            if not first: first = prev
            second = node
        prev = node
        
        inorder(node.right)
    
    inorder(root)
    first.val, second.val = second.val, first.val  # swap

*/
