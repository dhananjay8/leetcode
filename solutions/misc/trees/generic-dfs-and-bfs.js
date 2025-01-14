// Tree Node Definition
class TreeNode {
  constructor(val = 0) {
    this.val = val;
    this.children = []; // Array to store child nodes
  }
}

// BFS for a General Tree
function bfsTree(root) {
  if (!root) return [];

  const result = [];
  const queue = [root]; // Initialize the queue with the root

  while (queue.length > 0) {
    const node = queue.shift(); // Dequeue
    result.push(node.val);

    for (const child of node.children) {
      queue.push(child); // Enqueue all children
    }
  }

  return result;
}

// DFS for a General Tree
function dfsTree(root) {
  if (!root) return [];

  const result = [];
  const stack = [root]; // Initialize the stack with the root

  while (stack.length > 0) {
    const node = stack.pop(); // Pop the top node
    result.push(node.val);

    // Push children to the stack in reverse order to maintain left-to-right traversal
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push(node.children[i]);
    }
  }

  return result;
}

// Example Usage
const root = new TreeNode(1);
const child1 = new TreeNode(2);
const child2 = new TreeNode(3);
const child3 = new TreeNode(4);
root.children.push(child1, child2, child3);

console.log(bfsTree(root)); // Output: [1, 2, 3, 4]
console.log(dfsTree(root)); // Output: [1, 2, 3, 4]
