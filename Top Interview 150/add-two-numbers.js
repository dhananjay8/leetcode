/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2, carry = 0) {
  if (!l1 && !l2 && !carry) return null;
  let total = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + (carry || 0);

  carry = parseInt(total / 10);
  return new ListNode(total % 10, addTwoNumbers(l1?.next, l2?.next, carry));
};

// STEPS:
// 2 numbers like ( 743, 564 )
// Start from the left to right ( loop - index)
// Get the number by index ( index = 0 => 7, 5 )
// Add those numbers ( 7 + 5 => 12 )
// Carry it if it is greater than 9 ( var carry = 12 / 10 => 1 )
// Increase the index ( index + 1 )
// Go to step 3 ( We need to pass carry value )
