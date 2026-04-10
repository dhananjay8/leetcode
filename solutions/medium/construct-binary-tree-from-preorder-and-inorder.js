/**
 * Problem: Construct Binary Tree from Preorder and Inorder Traversal
 * Link: https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/
 * Difficulty: Medium
 *
 * Given preorder and inorder traversal arrays, construct the binary tree.
 *
 * Example: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7] => [3,9,20,null,null,15,7]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

function TreeNode(val, left, right) {
  this.val = val === undefined ? 0 : val;
  this.left = left === undefined ? null : left;
  this.right = right === undefined ? null : right;
}

// JavaScript Solution
function buildTree(preorder, inorder) {
  // Map inorder values to their indices for O(1) lookup
  const inorderMap = new Map();
  inorder.forEach((val, i) => inorderMap.set(val, i));

  let preIdx = 0; // tracks current root in preorder

  function build(left, right) {
    if (left > right) return null;

    const rootVal = preorder[preIdx++]; // first element in preorder = root
    const root = new TreeNode(rootVal);
    const inIdx = inorderMap.get(rootVal); // find root position in inorder

    // Everything left of inIdx in inorder = left subtree
    root.left = build(left, inIdx - 1);
    // Everything right of inIdx in inorder = right subtree
    root.right = build(inIdx + 1, right);

    return root;
  }

  return build(0, inorder.length - 1);
}

module.exports = buildTree;

/* Python Solution:

def buildTree(preorder, inorder):
    # Map inorder val -> index for quick lookup
    inorder_map = {val: i for i, val in enumerate(inorder)}
    pre_idx = [0]  # use list to maintain reference in closure
    
    def build(left, right):
        if left > right:
            return None
        
        root_val = preorder[pre_idx[0]]
        pre_idx[0] += 1
        root = TreeNode(root_val)
        
        in_idx = inorder_map[root_val]
        root.left = build(left, in_idx - 1)   # left subtree
        root.right = build(in_idx + 1, right)  # right subtree
        
        return root
    
    return build(0, len(inorder) - 1)

*/
