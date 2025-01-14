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
 * @return {boolean}
 */
var isValidBST = function (root) {
  return isValidNode(root, -Infinity, Infinity);
};

const isValidNode = function (node, low, high) {
  if (!node) return true;
  if (low < node.val && node.val < high) {
    return (
      isValidNode(node.left, low, node.val) &&
      isValidNode(node.right, node.val, high)
    );
  } else return false;
};
