var isSameTree = function (p, q) {
  if (p == null && q == null) {
    return true;
  }
  if (p == null || q == null || p.val != q.val) {
    return false;
  }
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};

// ALTERNATIVE APPROACH

/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} p
 * @param {TreeNode} q
 * @return {boolean}
 */
var isSameTree = function (p, q) {
  let rL = [],
    lL = [];
  dfs(p, lL);
  dfs(q, rL);
  return arrayEquals(lL, rL);
};

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

const dfs = function (root, arr) {
  if (!root) {
    arr.push("null");
    return;
  }
  arr.push(root.val);
  dfs(root.left, arr);
  dfs(root.right, arr);
};
