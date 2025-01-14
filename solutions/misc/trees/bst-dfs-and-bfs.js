// Binary Tree Node Definition
class BinaryTreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left; // Left child
    this.right = right; // Right child
  }
}

// BFS for a Binary Tree - Recursive
function bfsBinaryTree(root) {
  if (!root) return [];

  const result = [];
  const levels = [];

  function traverseLevel(node, level) {
    if (!node) return;

    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push(node.val);

    traverseLevel(node.left, level + 1); // Process left subtree
    traverseLevel(node.right, level + 1); // Process right subtree
  }

  traverseLevel(root, 0);

  for (const level of levels) {
    result.push(...level); // Flatten the levels into a single result array
  }

  return result;
}

// BFS for a Binary Tree
function bfsBinaryTree(root) {
  if (!root) return [];

  const result = [];
  const queue = [root]; // Initialize the queue with the root

  while (queue.length > 0) {
    const node = queue.shift(); // Dequeue
    result.push(node.val);

    if (node.left) queue.push(node.left); // Enqueue left child
    if (node.right) queue.push(node.right); // Enqueue right child
  }

  return result;
}

// DFS for a Binary Tree - Recursive

function dfsBinaryTree(root) {
  const result = [];

  function traverse(node) {
    if (!node) return;

    traverse(node.left); // Visit left subtree
    result.push(node.val); // Visit root
    traverse(node.right); // Visit right subtree
  }

  traverse(root);
  return result;
}

// DFS for a Binary Tree
function dfsBinaryTree(root) {
  if (!root) return [];

  const result = [];
  const stack = [root]; // Initialize the stack with the root

  while (stack.length > 0) {
    const node = stack.pop(); // Pop the top node
    result.push(node.val);

    if (node.right) stack.push(node.right); // Push right child
    if (node.left) stack.push(node.left); // Push left child
  }

  return result;
}

// Example Usage
const binaryRoot = new BinaryTreeNode(1);
binaryRoot.left = new BinaryTreeNode(2);
binaryRoot.right = new BinaryTreeNode(3);
binaryRoot.left.left = new BinaryTreeNode(4);
binaryRoot.left.right = new BinaryTreeNode(5);

console.log(bfsBinaryTree(binaryRoot)); // Output: [1, 2, 3, 4, 5]
console.log(dfsBinaryTree(binaryRoot)); // Output: [1, 2, 4, 5, 3]
