/**
 * 22. Find the Lowest Common Ancestor (LCA) of Two Nodes in a Binary Tree
 *
 * Problem: Given a binary tree, find the lowest common ancestor of two given nodes.
 * The LCA is the lowest node that has both nodes as descendants.
 *
 * Example:
 *        3
 *       / \
 *      5   1
 *     / \ / \
 *    6  2 0  8
 *      / \
 *     7   4
 * LCA(5, 1) = 3
 * LCA(5, 4) = 5
 */

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Approach 1: Recursive (Optimal)
 * Time Complexity: O(n)
 * Space Complexity: O(h) - recursion stack
 */
function lowestCommonAncestor(root, p, q) {
  // Base case: if root is null or equals p or q
  if (root === null || root === p || root === q) {
    return root;
  }

  // Search in left and right subtrees
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  // If both left and right are non-null, root is the LCA
  if (left !== null && right !== null) {
    return root;
  }

  // Return the non-null child
  return left !== null ? left : right;
}

/**
 * Approach 2: Using Parent Pointers
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function lowestCommonAncestorWithParent(root, p, q) {
  // Build parent map
  const parent = new Map();
  const stack = [root];
  parent.set(root, null);

  // Build parent map using BFS
  while (!parent.has(p) || !parent.has(q)) {
    const node = stack.pop();

    if (node.left) {
      parent.set(node.left, node);
      stack.push(node.left);
    }

    if (node.right) {
      parent.set(node.right, node);
      stack.push(node.right);
    }
  }

  // Find ancestors of p
  const ancestors = new Set();
  while (p !== null) {
    ancestors.add(p);
    p = parent.get(p);
  }

  // Find first common ancestor
  while (!ancestors.has(q)) {
    q = parent.get(q);
  }

  return q;
}

/**
 * Approach 3: Iterative with Stack
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function lowestCommonAncestorIterative(root, p, q) {
  const parent = new Map();
  const stack = [root];
  parent.set(root, null);

  while (stack.length > 0) {
    const node = stack.pop();

    if (node.left) {
      parent.set(node.left, node);
      stack.push(node.left);
    }

    if (node.right) {
      parent.set(node.right, node);
      stack.push(node.right);
    }

    if (parent.has(p) && parent.has(q)) {
      break;
    }
  }

  const ancestors = new Set();
  let current = p;

  while (current !== null) {
    ancestors.add(current);
    current = parent.get(current);
  }

  current = q;
  while (!ancestors.has(current)) {
    current = parent.get(current);
  }

  return current;
}

/**
 * For Binary Search Tree - More Efficient
 * Time Complexity: O(h) where h is height
 * Space Complexity: O(1)
 */
function lowestCommonAncestorBST(root, p, q) {
  while (root !== null) {
    // If both nodes are smaller, go left
    if (p.val < root.val && q.val < root.val) {
      root = root.left;
    }
    // If both nodes are larger, go right
    else if (p.val > root.val && q.val > root.val) {
      root = root.right;
    }
    // Found the split point
    else {
      return root;
    }
  }
  return null;
}

/**
 * Find LCA with path tracking
 * Returns the path from root to LCA
 */
function findLCAWithPath(root, p, q) {
  const path = [];

  function findPath(node, target, currentPath) {
    if (node === null) return false;

    currentPath.push(node);

    if (node === target) return true;

    if (
      findPath(node.left, target, currentPath) ||
      findPath(node.right, target, currentPath)
    ) {
      return true;
    }

    currentPath.pop();
    return false;
  }

  const pathP = [];
  const pathQ = [];

  findPath(root, p, pathP);
  findPath(root, q, pathQ);

  let lca = root;
  const minLen = Math.min(pathP.length, pathQ.length);

  for (let i = 0; i < minLen; i++) {
    if (pathP[i] === pathQ[i]) {
      lca = pathP[i];
    } else {
      break;
    }
  }

  return { lca, pathP, pathQ };
}

// Helper functions
function createBinaryTree(arr) {
  if (!arr || arr.length === 0) return null;

  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift();

    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;

    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

function findNode(root, val) {
  if (!root) return null;
  if (root.val === val) return root;

  return findNode(root.left, val) || findNode(root.right, val);
}

// Example usage
console.log("=== Lowest Common Ancestor ===\n");

const tree = createBinaryTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);

const node5 = findNode(tree, 5);
const node1 = findNode(tree, 1);
const node4 = findNode(tree, 4);
const node7 = findNode(tree, 7);

console.log("Test Case 1: LCA(5, 1)");
const lca1 = lowestCommonAncestor(tree, node5, node1);
console.log("Result:", lca1.val); // 3

console.log("\nTest Case 2: LCA(5, 4)");
const lca2 = lowestCommonAncestor(tree, node5, node4);
console.log("Result:", lca2.val); // 5

console.log("\nTest Case 3: LCA(7, 4)");
const lca3 = lowestCommonAncestor(tree, node7, node4);
console.log("Result:", lca3.val); // 2

/*
Python Implementation:

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def lowest_common_ancestor(root, p, q):
    """
    Recursive approach
    Time: O(n), Space: O(h)
    """
    if not root or root == p or root == q:
        return root
    
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    
    if left and right:
        return root
    
    return left if left else right

def lowest_common_ancestor_bst(root, p, q):
    """
    For BST - O(h) time, O(1) space
    """
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return None
*/
