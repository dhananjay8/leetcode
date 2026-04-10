/**
 * Problem: Path Sum
 * Link: https://leetcode.com/problems/path-sum/
 * Difficulty: Easy
 *
 * Return true if root-to-leaf path exists with given sum.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution
function hasPathSum(root, targetSum) {
  if (!root) return false;
  
  // Leaf node: check if remaining sum equals node value
  if (!root.left && !root.right) return targetSum === root.val;
  
  // Recurse with reduced sum
  return hasPathSum(root.left, targetSum - root.val) || 
         hasPathSum(root.right, targetSum - root.val);
}

module.exports = hasPathSum;

/* Python Solution:

def hasPathSum(root, targetSum):
    if not root: return False
    
    if not root.left and not root.right:
        return targetSum == root.val
    
    return (hasPathSum(root.left, targetSum - root.val) or 
            hasPathSum(root.right, targetSum - root.val))

*/
