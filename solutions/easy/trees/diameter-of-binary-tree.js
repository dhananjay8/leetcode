/**
 * Problem: Diameter of Binary Tree
 * Link: https://leetcode.com/problems/diameter-of-binary-tree/
 * Difficulty: Easy
 *
 * Diameter = longest path between any two nodes (number of edges).
 *
 * Example: [1,2,3,4,5] => 3 (path: 4->2->1->3 or 5->2->1->3)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// JavaScript Solution
function diameterOfBinaryTree(root) {
  let diameter = 0;

  function height(node) {
    if (!node) return 0;
    
    const left = height(node.left);
    const right = height(node.right);
    
    // Update diameter: path through this node = left + right
    diameter = Math.max(diameter, left + right);
    
    return Math.max(left, right) + 1; // return height
  }

  height(root);
  return diameter;
}

module.exports = diameterOfBinaryTree;

/* Python Solution:

def diameterOfBinaryTree(root):
    diameter = [0]
    
    def height(node):
        if not node: return 0
        left = height(node.left)
        right = height(node.right)
        diameter[0] = max(diameter[0], left + right)
        return max(left, right) + 1
    
    height(root)
    return diameter[0]

*/
