/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var deleteDuplicates = function (head) {
  let d = new ListNode(0); // Dummy node to handle edge cases
  d.next = head; // Link dummy to the original head
  let curr = head; // Pointer to iterate through the list
  let prev = d; // Pointer to the last distinct node

  while (curr) {
    // Check if current node has duplicates
    if (curr.next && curr.val === curr.next.val) {
      // Skip all nodes with the same value
      while (curr.next && curr.val === curr.next.val) {
        curr = curr.next;
      }
      // Link prev to the node after the last duplicate
      prev.next = curr.next;
    } else {
      // No duplicates, move prev forward
      prev = prev.next;
    }
    // Move curr forward
    curr = curr.next;
  }

  return d.next; // Return the head of the modified list
};
