/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function (root) {
  if (!root) return [];
  const result = [];

  const h = height(root);
  for (let i = 1; i <= h; i++) {
    const array = [];
    CurrentLevel(root, i, array);
    result.push(array);
  }
  return result;
};

function CurrentLevel(root, level, array) {
  if (root === null) {
    return;
  }
  if (level === 1) {
    return array.push(root.val);
  } else if (level > 1) {
    CurrentLevel(root.left, level - 1, array);
    CurrentLevel(root.right, level - 1, array);
  }
}

function height(root) {
  if (!root) return 0;
  return Math.max(height(root.left), height(root.right)) + 1;
}
