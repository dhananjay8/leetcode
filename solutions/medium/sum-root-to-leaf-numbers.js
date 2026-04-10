/**
 * Problem: Sum Root to Leaf Numbers
 * Link: https://leetcode.com/problems/sum-root-to-leaf-numbers/
 * Difficulty: Medium
 *
 * Each root-to-leaf path represents a number. Return the total sum of all numbers.
 *
 * Example: root = [1,2,3] => paths 1->2 = 12, 1->3 = 13, sum = 25
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution - DFS
function sumNumbers(root) {
  function dfs(node, currentNum) {
    if (!node) return 0;

    currentNum = currentNum * 10 + node.val; // build number digit by digit

    // If leaf, return the number
    if (!node.left && !node.right) return currentNum;

    // Sum from left and right subtrees
    return dfs(node.left, currentNum) + dfs(node.right, currentNum);
  }

  return dfs(root, 0);
}

module.exports = sumNumbers;

/* Python Solution:

def sumNumbers(root):
    def dfs(node, current_num):
        if not node:
            return 0
        
        current_num = current_num * 10 + node.val
        
        # Leaf node: return the formed number
        if not node.left and not node.right:
            return current_num
        
        return dfs(node.left, current_num) + dfs(node.right, current_num)
    
    return dfs(root, 0)

*/
