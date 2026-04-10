/**
 * Problem: Binary Tree Maximum Path Sum
 * Link: https://leetcode.com/problems/binary-tree-maximum-path-sum/
 * Difficulty: Hard
 *
 * Find the maximum path sum. Path can start and end at any node.
 *
 * Example: root = [-10,9,20,null,null,15,7] => 42 (15+20+7)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution
function maxPathSum(root) {
  let maxSum = -Infinity;

  function dfs(node) {
    if (!node) return 0;
    
    // Get max contribution from left and right (ignore negative paths)
    const left = Math.max(0, dfs(node.left));
    const right = Math.max(0, dfs(node.right));
    
    // Update global max: path through this node as the "turning point"
    maxSum = Math.max(maxSum, left + node.val + right);
    
    // Return max single-path contribution (can only go one direction up)
    return node.val + Math.max(left, right);
  }

  dfs(root);
  return maxSum;
}

module.exports = maxPathSum;

/* Python Solution:

def maxPathSum(root):
    max_sum = [float('-inf')]
    
    def dfs(node):
        if not node: return 0
        
        left = max(0, dfs(node.left))    # ignore negative paths
        right = max(0, dfs(node.right))
        
        # Path through this node
        max_sum[0] = max(max_sum[0], left + node.val + right)
        
        # Return single direction max
        return node.val + max(left, right)
    
    dfs(root)
    return max_sum[0]

*/
