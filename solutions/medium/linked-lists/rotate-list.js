/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
var rotateRight = function (head, k) {
  if (!head || !head.next || k === 0) return head;

  let length = 1;
  let current = head;

  // Find the length of the list and connect the tail to head to form a circle
  while (current.next) {
    current = current.next;
    length++;
  }
  current.next = head;

  // Find the new tail position
  let stepsToNewHead = length - (k % length);
  let newTail = head;

  for (let i = 1; i < stepsToNewHead; i++) {
    newTail = newTail.next;
  }

  // Break the circle and set the new head
  const newHead = newTail.next;
  newTail.next = null;

  return newHead;
};
