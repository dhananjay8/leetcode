/**
 * 21. Find the Height of a Binary Tree
 *
 * Problem: Find the height (or depth) of a binary tree.
 * Height is the number of edges on the longest path from root to leaf.
 *
 * Example:
 *       1
 *      / \
 *     2   3
 *    / \
 *   4   5
 * Height = 2
 */

// TreeNode class definition
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Approach 1: Recursive (DFS)
 * Time Complexity: O(n) where n is number of nodes
 * Space Complexity: O(h) where h is height (recursion stack)
 */
function maxDepth(root) {
  // Base case: empty tree has height -1 (or 0 if counting nodes)
  if (root === null) {
    return 0; // Return 0 for counting levels, -1 for edges
  }

  // Recursive case: height = 1 + max(left subtree height, right subtree height)
  const leftHeight = maxDepth(root.left);
  const rightHeight = maxDepth(root.right);

  return 1 + Math.max(leftHeight, rightHeight);
}

/**
 * Approach 2: Iterative (Level Order Traversal / BFS)
 * Time Complexity: O(n)
 * Space Complexity: O(w) where w is maximum width of tree
 */
function maxDepthIterative(root) {
  if (root === null) {
    return 0;
  }

  const queue = [root];
  let height = 0;

  while (queue.length > 0) {
    const levelSize = queue.length;

    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    height++;
  }

  return height;
}

/**
 * Approach 3: Iterative DFS using Stack
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */
function maxDepthIterativeDFS(root) {
  if (root === null) {
    return 0;
  }

  const stack = [[root, 1]]; // [node, depth]
  let maxHeight = 0;

  while (stack.length > 0) {
    const [node, depth] = stack.pop();

    maxHeight = Math.max(maxHeight, depth);

    if (node.right) stack.push([node.right, depth + 1]);
    if (node.left) stack.push([node.left, depth + 1]);
  }

  return maxHeight;
}

/**
 * Find minimum depth of binary tree
 * Minimum depth is shortest path from root to leaf
 */
function minDepth(root) {
  if (root === null) {
    return 0;
  }

  // Leaf node
  if (root.left === null && root.right === null) {
    return 1;
  }

  // If one subtree is null, return depth of other
  if (root.left === null) {
    return 1 + minDepth(root.right);
  }

  if (root.right === null) {
    return 1 + minDepth(root.left);
  }

  // Both subtrees exist
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}

/**
 * Find depth of a specific node
 */
function findDepth(root, target) {
  if (root === null) {
    return -1;
  }

  if (root.val === target) {
    return 0;
  }

  const leftDepth = findDepth(root.left, target);
  if (leftDepth !== -1) {
    return leftDepth + 1;
  }

  const rightDepth = findDepth(root.right, target);
  if (rightDepth !== -1) {
    return rightDepth + 1;
  }

  return -1;
}

/**
 * Check if tree is balanced
 * A balanced tree has height difference <= 1 for all nodes
 */
function isBalanced(root) {
  function checkBalance(node) {
    if (node === null) {
      return 0;
    }

    const leftHeight = checkBalance(node.left);
    if (leftHeight === -1) return -1;

    const rightHeight = checkBalance(node.right);
    if (rightHeight === -1) return -1;

    if (Math.abs(leftHeight - rightHeight) > 1) {
      return -1;
    }

    return 1 + Math.max(leftHeight, rightHeight);
  }

  return checkBalance(root) !== -1;
}

// Helper function to create a binary tree from array (level order)
function createBinaryTree(arr) {
  if (!arr || arr.length === 0) return null;

  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift();

    // Left child
    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;

    // Right child
    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

// Helper function to print tree structure
function printTree(root, prefix = "", isLeft = true) {
  if (root === null) return;

  console.log(prefix + (isLeft ? "├── " : "└── ") + root.val);

  if (root.left || root.right) {
    if (root.left) {
      printTree(root.left, prefix + (isLeft ? "│   " : "    "), true);
    }
    if (root.right) {
      printTree(root.right, prefix + (isLeft ? "│   " : "    "), false);
    }
  }
}

// Example usage and test cases
console.log("=== Height of Binary Tree ===\n");

// Test Case 1: Balanced tree
console.log("Test Case 1: Balanced Binary Tree");
const tree1 = createBinaryTree([1, 2, 3, 4, 5, 6, 7]);
printTree(tree1);
console.log("Max Height (Recursive):", maxDepth(tree1)); // 3
console.log("Max Height (Iterative BFS):", maxDepthIterative(tree1)); // 3
console.log("Max Height (Iterative DFS):", maxDepthIterativeDFS(tree1)); // 3
console.log("Min Height:", minDepth(tree1)); // 3
console.log("Is Balanced?", isBalanced(tree1)); // true
console.log();

// Test Case 2: Skewed tree (left)
console.log("Test Case 2: Left-Skewed Tree");
const tree2 = createBinaryTree([1, 2, null, 3, null, 4]);
printTree(tree2);
console.log("Max Height:", maxDepth(tree2)); // 4
console.log("Min Height:", minDepth(tree2)); // 1
console.log("Is Balanced?", isBalanced(tree2)); // false
console.log();

// Test Case 3: Skewed tree (right)
console.log("Test Case 3: Right-Skewed Tree");
const tree3 = createBinaryTree([1, null, 2, null, 3, null, 4]);
printTree(tree3);
console.log("Max Height:", maxDepth(tree3)); // 4
console.log("Min Height:", minDepth(tree3)); // 1
console.log();

// Test Case 4: Single node
console.log("Test Case 4: Single Node");
const tree4 = createBinaryTree([1]);
console.log("Max Height:", maxDepth(tree4)); // 1
console.log("Min Height:", minDepth(tree4)); // 1
console.log();

// Test Case 5: Empty tree
console.log("Test Case 5: Empty Tree");
const tree5 = null;
console.log("Max Height:", maxDepth(tree5)); // 0
console.log("Min Height:", minDepth(tree5)); // 0
console.log();

// Test Case 6: Find depth of specific node
console.log("Test Case 6: Find Depth of Node");
const tree6 = createBinaryTree([1, 2, 3, 4, 5]);
printTree(tree6);
console.log("Depth of node 1:", findDepth(tree6, 1)); // 0
console.log("Depth of node 2:", findDepth(tree6, 2)); // 1
console.log("Depth of node 4:", findDepth(tree6, 4)); // 2
console.log("Depth of node 99:", findDepth(tree6, 99)); // -1

/*
Python Implementation:

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def max_depth(root):
    """
    Approach 1: Recursive
    Time: O(n), Space: O(h)
    """
    if not root:
        return 0
    
    left_height = max_depth(root.left)
    right_height = max_depth(root.right)
    
    return 1 + max(left_height, right_height)

def max_depth_iterative(root):
    """
    Approach 2: Iterative BFS
    Time: O(n), Space: O(w)
    """
    if not root:
        return 0
    
    from collections import deque
    queue = deque([root])
    height = 0
    
    while queue:
        level_size = len(queue)
        
        for _ in range(level_size):
            node = queue.popleft()
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        height += 1
    
    return height

def min_depth(root):
    """
    Find minimum depth (shortest path to leaf)
    """
    if not root:
        return 0
    
    # Leaf node
    if not root.left and not root.right:
        return 1
    
    # One subtree is null
    if not root.left:
        return 1 + min_depth(root.right)
    
    if not root.right:
        return 1 + min_depth(root.left)
    
    # Both subtrees exist
    return 1 + min(min_depth(root.left), min_depth(root.right))

def is_balanced(root):
    """
    Check if tree is balanced
    """
    def check_balance(node):
        if not node:
            return 0
        
        left_height = check_balance(node.left)
        if left_height == -1:
            return -1
        
        right_height = check_balance(node.right)
        if right_height == -1:
            return -1
        
        if abs(left_height - right_height) > 1:
            return -1
        
        return 1 + max(left_height, right_height)
    
    return check_balance(root) != -1

# Example usage
if __name__ == "__main__":
    # Create tree: [1, 2, 3, 4, 5]
    root = TreeNode(1)
    root.left = TreeNode(2)
    root.right = TreeNode(3)
    root.left.left = TreeNode(4)
    root.left.right = TreeNode(5)
    
    print("Max Height:", max_depth(root))  # 3
    print("Min Height:", min_depth(root))  # 2
    print("Is Balanced:", is_balanced(root))  # True
*/
