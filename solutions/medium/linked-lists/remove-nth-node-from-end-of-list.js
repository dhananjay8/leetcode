/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function (head, n) {
  const dummy = new ListNode(0, head); // Add a dummy node to handle edge cases
  let first = dummy;
  let second = dummy;

  // Move the `first` pointer n+1 steps ahead
  for (let i = 0; i <= n; i++) {
    first = first.next;
  }
  console.log("first", first);

  // Move both pointers until `first` reaches the end
  while (first) {
    first = first.next;
    second = second.next;
  }
  console.log("first2", first);
  console.log("second2", second);

  // `second.next` is the node to be removed, skip it
  second.next = second.next.next;

  return dummy.next;
};
