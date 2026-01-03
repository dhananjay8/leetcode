/**
 * 24. Serialize and Deserialize a Binary Tree
 *
 * Problem: Design algorithms to serialize and deserialize a binary tree.
 * Serialization: convert tree to string
 * Deserialization: convert string back to tree
 */

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Approach 1: Level Order (BFS)
 * Time: O(n) for both, Space: O(n)
 */
function serialize(root) {
  if (root === null) return "";

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();

    if (node === null) {
      result.push("null");
    } else {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    }
  }

  return result.join(",");
}

function deserialize(data) {
  if (!data) return null;

  const values = data.split(",");
  const root = new TreeNode(parseInt(values[0]));
  const queue = [root];
  let i = 1;

  while (queue.length > 0 && i < values.length) {
    const node = queue.shift();

    if (values[i] !== "null") {
      node.left = new TreeNode(parseInt(values[i]));
      queue.push(node.left);
    }
    i++;

    if (i < values.length && values[i] !== "null") {
      node.right = new TreeNode(parseInt(values[i]));
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

/**
 * Approach 2: Preorder (DFS)
 * Time: O(n), Space: O(h)
 */
function serializePreorder(root) {
  function dfs(node) {
    if (node === null) return "null";
    return `${node.val},${dfs(node.left)},${dfs(node.right)}`;
  }
  return dfs(root);
}

function deserializePreorder(data) {
  const values = data.split(",");
  let index = 0;

  function dfs() {
    if (values[index] === "null") {
      index++;
      return null;
    }

    const node = new TreeNode(parseInt(values[index++]));
    node.left = dfs();
    node.right = dfs();
    return node;
  }

  return dfs();
}

// Example usage
console.log("=== Serialize/Deserialize Binary Tree ===\n");

const tree = new TreeNode(
  1,
  new TreeNode(2),
  new TreeNode(3, new TreeNode(4), new TreeNode(5))
);

const serialized = serialize(tree);
console.log("Serialized:", serialized);

const deserialized = deserialize(serialized);
console.log("Deserialized root value:", deserialized.val);

/*
Python Implementation:

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def serialize(root):
    if not root:
        return ''
    
    from collections import deque
    result = []
    queue = deque([root])
    
    while queue:
        node = queue.popleft()
        
        if node:
            result.append(str(node.val))
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append('null')
    
    return ','.join(result)

def deserialize(data):
    if not data:
        return None
    
    from collections import deque
    values = data.split(',')
    root = TreeNode(int(values[0]))
    queue = deque([root])
    i = 1
    
    while queue and i < len(values):
        node = queue.popleft()
        
        if values[i] != 'null':
            node.left = TreeNode(int(values[i]))
            queue.append(node.left)
        i += 1
        
        if i < len(values) and values[i] != 'null':
            node.right = TreeNode(int(values[i]))
            queue.append(node.right)
        i += 1
    
    return root
*/
