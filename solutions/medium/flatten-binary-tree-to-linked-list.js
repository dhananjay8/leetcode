/**
 * Problem: Flatten Binary Tree to Linked List
 * Link: https://leetcode.com/problems/flatten-binary-tree-to-linked-list/
 * Difficulty: Medium
 *
 * Flatten the tree to a "linked list" in-place using preorder traversal.
 * Use the right pointer as next, left should be null.
 *
 * Example: [1,2,5,3,4,null,6] => [1,null,2,null,3,null,4,null,5,null,6]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1) for Morris-like approach
 */

// JavaScript Solution - Morris-like O(1) space
function flatten(root) {
  let current = root;

  while (current) {
    if (current.left) {
      // Find the rightmost node of the left subtree
      let rightmost = current.left;
      while (rightmost.right) {
        rightmost = rightmost.right;
      }
      // Connect rightmost to current's right subtree
      rightmost.right = current.right;
      // Move left subtree to right
      current.right = current.left;
      current.left = null;
    }
    current = current.right; // move to next node
  }
}

module.exports = flatten;

/* Python Solution:

def flatten(root):
    current = root
    
    while current:
        if current.left:
            # Find rightmost node in left subtree
            rightmost = current.left
            while rightmost.right:
                rightmost = rightmost.right
            
            # Rewire: left subtree goes to right, old right goes after rightmost
            rightmost.right = current.right
            current.right = current.left
            current.left = None
        
        current = current.right  # advance

*/
