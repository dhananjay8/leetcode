/**
 * Problem: Binary Tree Zigzag Level Order Traversal
 * Link: https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/
 * Difficulty: Medium
 *
 * Return zigzag level order traversal: left-to-right, then right-to-left, alternating.
 *
 * Example: root = [3,9,20,null,null,15,7] => Output: [[3],[20,9],[15,7]]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - BFS with direction toggle
function zigzagLevelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];
  let leftToRight = true;

  while (queue.length) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();

      // Insert at front or back depending on direction
      if (leftToRight) {
        level.push(node.val);
      } else {
        level.unshift(node.val);
      }

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
    leftToRight = !leftToRight; // toggle direction
  }

  return result;
}

module.exports = zigzagLevelOrder;

/* Python Solution:

from collections import deque

def zigzagLevelOrder(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    left_to_right = True
    
    while queue:
        level = deque()
        for _ in range(len(queue)):
            node = queue.popleft()
            # Append to right or left of deque based on direction
            if left_to_right:
                level.append(node.val)
            else:
                level.appendleft(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        
        result.append(list(level))
        left_to_right = not left_to_right
    
    return result

*/
