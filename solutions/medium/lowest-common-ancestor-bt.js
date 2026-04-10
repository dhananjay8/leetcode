/**
 * Problem: Lowest Common Ancestor of a Binary Tree
 * Link: https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/
 * Difficulty: Medium
 *
 * Given a binary tree, find the LCA of two given nodes.
 *
 * Example: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1 => Output: 3
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution - Recursive DFS
function lowestCommonAncestor(root, p, q) {
  // Base case: if root is null or matches p or q
  if (!root || root === p || root === q) return root;

  // Search in left and right subtrees
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // If both sides return non-null, current node is the LCA
  if (left && right) return root;

  // Otherwise, return whichever side found something
  return left || right;
}

module.exports = lowestCommonAncestor;

/* Python Solution:

def lowestCommonAncestor(root, p, q):
    # Base case: reached null or found p or q
    if not root or root == p or root == q:
        return root
    
    # Search both subtrees
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    
    # If both subtrees found a target, root is the LCA
    if left and right:
        return root
    
    # Return whichever side found something
    return left or right

*/
