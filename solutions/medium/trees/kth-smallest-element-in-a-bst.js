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
 * @param {number} k
 * @return {number}
 */
var kthSmallest = function (root, k) {
  const inorder = [];
  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    inorder.push(node.val);
    dfs(node.right);
  }
  dfs(root);
  return inorder[k - 1];
};
