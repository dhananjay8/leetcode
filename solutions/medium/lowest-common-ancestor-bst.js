/**
 * Problem: Lowest Common Ancestor of a Binary Search Tree
 * Link: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/
 * Difficulty: Medium
 *
 * Given a BST, find the lowest common ancestor (LCA) of two given nodes.
 *
 * Example: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8 => Output: 6
 *
 * Time Complexity: O(h) where h is tree height
 * Space Complexity: O(1) iterative, O(h) recursive
 */

// JavaScript Solution - Iterative (BST property)
function lowestCommonAncestor(root, p, q) {
  let node = root;

  while (node) {
    if (p.val < node.val && q.val < node.val) {
      // Both nodes are in the left subtree
      node = node.left;
    } else if (p.val > node.val && q.val > node.val) {
      // Both nodes are in the right subtree
      node = node.right;
    } else {
      // Split point found: one node on each side, or one equals current
      return node;
    }
  }

  return null;
}

// Recursive version
function lowestCommonAncestorRecursive(root, p, q) {
  if (p.val < root.val && q.val < root.val) return lowestCommonAncestorRecursive(root.left, p, q);
  if (p.val > root.val && q.val > root.val) return lowestCommonAncestorRecursive(root.right, p, q);
  return root; // split point
}

module.exports = lowestCommonAncestor;

/* Python Solution:

def lowestCommonAncestor(root, p, q):
    # Iterative: use BST property to navigate
    node = root
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left   # both in left subtree
        elif p.val > node.val and q.val > node.val:
            node = node.right  # both in right subtree
        else:
            return node  # split point = LCA

*/
