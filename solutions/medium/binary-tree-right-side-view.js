/**
 * Problem: Binary Tree Right Side View
 * Link: https://leetcode.com/problems/binary-tree-right-side-view/
 * Difficulty: Medium
 *
 * Given the root of a binary tree, return the values of the nodes you can see
 * ordered from top to bottom when looking from the right side.
 *
 * Example: root = [1,2,3,null,5,null,4] => Output: [1,3,4]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - BFS (Level Order Traversal)
function rightSideView(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();

      // Last node in current level is visible from the right
      if (i === levelSize - 1) result.push(node.val);

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  return result;
}

// DFS approach - track depth, visit right first
function rightSideViewDFS(root) {
  const result = [];

  function dfs(node, depth) {
    if (!node) return;
    // First node we see at this depth (from the right) gets added
    if (depth === result.length) result.push(node.val);
    dfs(node.right, depth + 1); // visit right first
    dfs(node.left, depth + 1);
  }

  dfs(root, 0);
  return result;
}

module.exports = rightSideView;

/* Python Solution:

from collections import deque

def rightSideView(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            # Last node in level is visible from right
            if i == level_size - 1:
                result.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
    
    return result

*/
