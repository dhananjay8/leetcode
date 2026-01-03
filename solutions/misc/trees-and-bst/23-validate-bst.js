/**
 * 23. Validate if a Binary Tree is a Valid Binary Search Tree (BST)
 *
 * Problem: Determine if a binary tree is a valid BST.
 * A valid BST has all left descendants < node < all right descendants.
 */

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Approach 1: Recursive with Range
 * Time: O(n), Space: O(h)
 */
function isValidBST(root) {
  function validate(node, min, max) {
    if (node === null) return true;

    if (node.val <= min || node.val >= max) return false;

    return (
      validate(node.left, min, node.val) && validate(node.right, node.val, max)
    );
  }

  return validate(root, -Infinity, Infinity);
}

/**
 * Approach 2: Inorder Traversal
 * BST inorder traversal is sorted
 * Time: O(n), Space: O(n)
 */
function isValidBSTInorder(root) {
  const inorder = [];

  function traverse(node) {
    if (node === null) return;
    traverse(node.left);
    inorder.push(node.val);
    traverse(node.right);
  }

  traverse(root);

  for (let i = 1; i < inorder.length; i++) {
    if (inorder[i] <= inorder[i - 1]) return false;
  }

  return true;
}

/**
 * Approach 3: Iterative Inorder
 * Time: O(n), Space: O(h)
 */
function isValidBSTIterative(root) {
  const stack = [];
  let current = root;
  let prev = null;

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }

    current = stack.pop();

    if (prev !== null && current.val <= prev.val) {
      return false;
    }

    prev = current;
    current = current.right;
  }

  return true;
}

// Example usage
console.log("=== Validate BST ===\n");

const validBST = new TreeNode(2, new TreeNode(1), new TreeNode(3));
console.log("Valid BST:", isValidBST(validBST)); // true

const invalidBST = new TreeNode(
  5,
  new TreeNode(1),
  new TreeNode(4, new TreeNode(3), new TreeNode(6))
);
console.log("Invalid BST:", isValidBST(invalidBST)); // false

/*
Python Implementation:

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def is_valid_bst(root):
    def validate(node, min_val, max_val):
        if not node:
            return True
        
        if node.val <= min_val or node.val >= max_val:
            return False
        
        return validate(node.left, min_val, node.val) and \
               validate(node.right, node.val, max_val)
    
    return validate(root, float('-inf'), float('inf'))

def is_valid_bst_inorder(root):
    inorder = []
    
    def traverse(node):
        if not node:
            return
        traverse(node.left)
        inorder.append(node.val)
        traverse(node.right)
    
    traverse(root)
    
    for i in range(1, len(inorder)):
        if inorder[i] <= inorder[i-1]:
            return False
    
    return True
*/
