/**
 * Problem: Path Sum II
 * Link: https://leetcode.com/problems/path-sum-ii/
 * Difficulty: Medium
 *
 * Find all root-to-leaf paths where the sum of node values equals targetSum.
 *
 * Example: root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22
 * Output: [[5,4,11,2],[5,8,4,5]]
 *
 * Time Complexity: O(n^2) worst case (n nodes, path copy is O(n))
 * Space Complexity: O(n) for recursion stack
 */

// JavaScript Solution - DFS Backtracking
function pathSum(root, targetSum) {
  const result = [];

  function dfs(node, remaining, path) {
    if (!node) return;

    path.push(node.val);

    // Check if it's a leaf and sum matches
    if (!node.left && !node.right && remaining === node.val) {
      result.push([...path]); // copy current path
    }

    // Recurse into children
    dfs(node.left, remaining - node.val, path);
    dfs(node.right, remaining - node.val, path);

    path.pop(); // backtrack
  }

  dfs(root, targetSum, []);
  return result;
}

module.exports = pathSum;

/* Python Solution:

def pathSum(root, targetSum):
    result = []
    
    def dfs(node, remaining, path):
        if not node:
            return
        
        path.append(node.val)
        
        # Leaf node with matching sum
        if not node.left and not node.right and remaining == node.val:
            result.append(list(path))  # copy path
        
        dfs(node.left, remaining - node.val, path)
        dfs(node.right, remaining - node.val, path)
        
        path.pop()  # backtrack
    
    dfs(root, targetSum, [])
    return result

*/
