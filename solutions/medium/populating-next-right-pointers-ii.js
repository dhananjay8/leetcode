/**
 * Problem: Populating Next Right Pointers in Each Node II
 * Link: https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/
 * Difficulty: Medium
 *
 * Populate each next pointer to point to its next right node.
 * If there is no next right node, set it to NULL. Tree may not be perfect.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1) using the established next pointers
 */

// JavaScript Solution - BFS with constant space
function connect(root) {
  if (!root) return root;

  let current = root; // current level's starting node

  while (current) {
    let dummy = { next: null }; // dummy node for next level's linked list
    let tail = dummy; // tail of next level's linked list

    // Traverse current level using next pointers
    let node = current;
    while (node) {
      if (node.left) {
        tail.next = node.left; // connect left child
        tail = tail.next;
      }
      if (node.right) {
        tail.next = node.right; // connect right child
        tail = tail.next;
      }
      node = node.next; // move to next node in current level
    }

    current = dummy.next; // move to next level
  }

  return root;
}

module.exports = connect;

/* Python Solution:

def connect(root):
    if not root:
        return root
    
    current = root
    
    while current:
        dummy = Node(0)  # dummy head for next level
        tail = dummy
        
        node = current
        while node:
            if node.left:
                tail.next = node.left
                tail = tail.next
            if node.right:
                tail.next = node.right
                tail = tail.next
            node = node.next  # traverse current level
        
        current = dummy.next  # move to next level
    
    return root

*/
