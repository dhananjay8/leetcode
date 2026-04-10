/**
 * Problem: Minimum Absolute Difference in BST
 * Link: https://leetcode.com/problems/minimum-absolute-difference-in-bst/
 * Difficulty: Easy
 *
 * Find minimum absolute difference between values of any two nodes in BST.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution - Inorder traversal (BST inorder = sorted)
function getMinimumDifference(root) {
  let prev = null;
  let minDiff = Infinity;

  function inorder(node) {
    if (!node) return;
    
    inorder(node.left);
    
    // Compare with previous node in sorted order
    if (prev !== null) {
      minDiff = Math.min(minDiff, node.val - prev);
    }
    prev = node.val;
    
    inorder(node.right);
  }

  inorder(root);
  return minDiff;
}

module.exports = getMinimumDifference;

/* Python Solution:

def getMinimumDifference(root):
    prev = [None]
    min_diff = [float('inf')]
    
    def inorder(node):
        if not node: return
        inorder(node.left)
        if prev[0] is not None:
            min_diff[0] = min(min_diff[0], node.val - prev[0])
        prev[0] = node.val
        inorder(node.right)
    
    inorder(root)
    return min_diff[0]

*/
