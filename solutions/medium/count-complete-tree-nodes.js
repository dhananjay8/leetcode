/**
 * Problem: Count Complete Tree Nodes
 * Link: https://leetcode.com/problems/count-complete-tree-nodes/
 * Difficulty: Medium
 *
 * Count the number of nodes in a complete binary tree.
 * Do it in less than O(n) time complexity.
 *
 * Time Complexity: O(log^2 n) — log n height checks, each O(log n)
 * Space Complexity: O(log n) recursion stack
 */

// JavaScript Solution - Binary Search on Complete Tree Property
function countNodes(root) {
  if (!root) return 0;

  // Get left and right heights
  let leftHeight = 0, rightHeight = 0;
  let left = root, right = root;

  while (left) { leftHeight++; left = left.left; }
  while (right) { rightHeight++; right = right.right; }

  // If heights are equal, it's a perfect binary tree
  if (leftHeight === rightHeight) {
    return Math.pow(2, leftHeight) - 1; // 2^h - 1 nodes
  }

  // Otherwise, recursively count left and right subtrees + 1 (root)
  return 1 + countNodes(root.left) + countNodes(root.right);
}

module.exports = countNodes;

/* Python Solution:

def countNodes(root):
    if not root:
        return 0
    
    left_h, right_h = 0, 0
    left, right = root, root
    
    while left:
        left_h += 1
        left = left.left
    while right:
        right_h += 1
        right = right.right
    
    # Perfect tree: 2^h - 1
    if left_h == right_h:
        return (2 ** left_h) - 1
    
    return 1 + countNodes(root.left) + countNodes(root.right)

*/
