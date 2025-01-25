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
var reverseList = function (head) {
  if (!head || !head.next) return head;
  let current = head;
  let prev = null;
  while (current) {
    // Reverse the current node's pointer
    // Move prev to the current node
    // Move to the next node
    [current.next, prev, current] = [prev, current, current.next];
  }
  return prev;
};
