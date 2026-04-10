/**
 * Problem: Count Good Nodes in Binary Tree
 * Link: https://leetcode.com/problems/count-good-nodes-in-binary-tree/
 * Difficulty: Medium
 *
 * A node is "good" if the path from root to it has no node with greater value.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution - DFS tracking max so far
function goodNodes(root) {
  function dfs(node, maxSoFar) {
    if (!node) return 0;
    
    let count = 0;
    if (node.val >= maxSoFar) count = 1; // this node is "good"
    
    const newMax = Math.max(maxSoFar, node.val);
    count += dfs(node.left, newMax);
    count += dfs(node.right, newMax);
    
    return count;
  }

  return dfs(root, root.val);
}

module.exports = goodNodes;

/* Python Solution:

def goodNodes(root):
    def dfs(node, max_so_far):
        if not node: return 0
        
        count = 1 if node.val >= max_so_far else 0
        new_max = max(max_so_far, node.val)
        count += dfs(node.left, new_max)
        count += dfs(node.right, new_max)
        return count
    
    return dfs(root, root.val)

*/
