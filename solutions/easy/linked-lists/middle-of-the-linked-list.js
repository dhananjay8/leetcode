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
var middleNode = function (head) {
  if (head.length < 2) return head;
  let ptr1 = head;
  let ptr2 = head;
  while (ptr2 && ptr2.next) {
    ptr1 = ptr1.next;
    if (!ptr2.next) break;
    ptr2 = ptr2.next.next;
  }
  return ptr1;
};
