/**
 * Problem: Construct Binary Tree from Inorder and Postorder Traversal
 * Link: https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/
 * Difficulty: Medium
 *
 * Given inorder and postorder traversal arrays, construct the binary tree.
 *
 * Example: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3] => [3,9,20,null,null,15,7]
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
function buildTree(inorder, postorder) {
  const inorderMap = new Map();
  inorder.forEach((val, i) => inorderMap.set(val, i));

  let postIdx = postorder.length - 1; // start from the end (root is last)

  function build(left, right) {
    if (left > right) return null;

    const rootVal = postorder[postIdx--]; // last element in postorder = root
    const root = new TreeNode(rootVal);
    const inIdx = inorderMap.get(rootVal);

    // Build right subtree FIRST (postorder goes right-to-left from end)
    root.right = build(inIdx + 1, right);
    root.left = build(left, inIdx - 1);

    return root;
  }

  return build(0, inorder.length - 1);
}

module.exports = buildTree;

/* Python Solution:

def buildTree(inorder, postorder):
    inorder_map = {val: i for i, val in enumerate(inorder)}
    post_idx = [len(postorder) - 1]
    
    def build(left, right):
        if left > right:
            return None
        
        root_val = postorder[post_idx[0]]
        post_idx[0] -= 1
        root = TreeNode(root_val)
        in_idx = inorder_map[root_val]
        
        # Build right subtree first (postorder processes right before left from end)
        root.right = build(in_idx + 1, right)
        root.left = build(left, in_idx - 1)
        
        return root
    
    return build(0, len(inorder) - 1)

*/
