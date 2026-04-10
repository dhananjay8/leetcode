/**
 * Problem: Subtree of Another Tree
 * Link: https://leetcode.com/problems/subtree-of-another-tree/
 * Difficulty: Easy
 *
 * Check if subRoot is a subtree of root.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m + n) for recursion
 */

// JavaScript Solution
function isSubtree(root, subRoot) {
  if (!root) return false;
  
  // Check if trees match at current node, or recurse left/right
  return isSameTree(root, subRoot) || 
         isSubtree(root.left, subRoot) || 
         isSubtree(root.right, subRoot);
}

function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q) return false;
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

module.exports = isSubtree;

/* Python Solution:

def isSubtree(root, subRoot):
    if not root: return False
    
    def isSame(p, q):
        if not p and not q: return True
        if not p or not q: return False
        return p.val == q.val and isSame(p.left, q.left) and isSame(p.right, q.right)
    
    return isSame(root, subRoot) or isSubtree(root.left, subRoot) or isSubtree(root.right, subRoot)

*/
