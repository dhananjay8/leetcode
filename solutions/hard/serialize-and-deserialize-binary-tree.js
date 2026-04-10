/**
 * Problem: Serialize and Deserialize Binary Tree
 * Link: https://leetcode.com/problems/serialize-and-deserialize-binary-tree/
 * Difficulty: Hard
 *
 * Design an algorithm to serialize/deserialize a binary tree to/from a string.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

function TreeNode(val) { this.val = val; this.left = this.right = null; }

// JavaScript Solution - Preorder traversal with null markers
const serialize = (root) => {
  if (!root) return 'null';
  // Preorder: root, left, right
  return root.val + ',' + serialize(root.left) + ',' + serialize(root.right);
};

const deserialize = (data) => {
  const nodes = data.split(',');
  let idx = 0;

  function build() {
    if (nodes[idx] === 'null') { idx++; return null; }
    
    const node = new TreeNode(parseInt(nodes[idx++]));
    node.left = build();
    node.right = build();
    return node;
  }

  return build();
};

module.exports = { serialize, deserialize };

/* Python Solution:

class Codec:
    def serialize(self, root):
        if not root: return 'null'
        return f'{root.val},{self.serialize(root.left)},{self.serialize(root.right)}'
    
    def deserialize(self, data):
        nodes = iter(data.split(','))
        
        def build():
            val = next(nodes)
            if val == 'null': return None
            node = TreeNode(int(val))
            node.left = build()
            node.right = build()
            return node
        
        return build()

*/
