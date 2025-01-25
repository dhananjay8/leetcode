/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  if (!head || !head.next) return false;
  let ptr1 = head,
    ptr2 = head.next;
  while (true) {
    if (!ptr1 || !ptr2 || !ptr2.next) return false;
    if (ptr1 == ptr2) return true;
    ptr1 = ptr1.next;
    ptr2 = ptr2.next.next;
  }
};
