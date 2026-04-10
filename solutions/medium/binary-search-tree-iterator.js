/**
 * Problem: Binary Search Tree Iterator
 * Link: https://leetcode.com/problems/binary-search-tree-iterator/
 * Difficulty: Medium
 *
 * Implement an iterator over a BST with next() and hasNext().
 * next() returns the next smallest number.
 *
 * Time Complexity: O(1) average per next() call
 * Space Complexity: O(h) for the stack
 */

// JavaScript Solution - Controlled Inorder using Stack
class BSTIterator {
  constructor(root) {
    this.stack = [];
    this._pushLeft(root); // initialize with leftmost path
  }

  // Push all left children onto stack
  _pushLeft(node) {
    while (node) {
      this.stack.push(node);
      node = node.left;
    }
  }

  // Return the next smallest number
  next() {
    const node = this.stack.pop();
    if (node.right) {
      this._pushLeft(node.right); // process right subtree
    }
    return node.val;
  }

  // Return whether we have a next smallest number
  hasNext() {
    return this.stack.length > 0;
  }
}

module.exports = BSTIterator;

/* Python Solution:

class BSTIterator:
    def __init__(self, root):
        self.stack = []
        self._push_left(root)
    
    def _push_left(self, node):
        while node:
            self.stack.append(node)
            node = node.left
    
    def next(self):
        node = self.stack.pop()
        if node.right:
            self._push_left(node.right)
        return node.val
    
    def hasNext(self):
        return len(self.stack) > 0

*/
