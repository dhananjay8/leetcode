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
var oddEvenList = function (head) {
  if (!head || !head.next) return head; // If list has 0 or 1 node, no reordering needed

  let odd = head; // Points to the head of the odd-indexed list
  let even = head.next; // Points to the head of the even-indexed list
  let evenHead = even; // Keep a reference to the start of the even list

  while (even && even.next) {
    odd.next = even.next; // Link current odd node to the next odd node
    odd = odd.next; // Move odd pointer forward

    even.next = odd.next; // Link current even node to the next even node
    even = even.next; // Move even pointer forward
  }

  // Attach the even list at the end of the odd list
  odd.next = evenHead;

  return head;
};
