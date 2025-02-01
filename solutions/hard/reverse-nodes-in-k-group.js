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
var reverseKGroup = function (head, k) {
  if (!head || k <= 1) return head; // If the list is empty or k is 1, return the original list

  let dummy = new ListNode(0); // Dummy node to handle edge cases (e.g., head reversal)
  dummy.next = head;
  let prevGroupEnd = dummy; // Pointer to the last node of the previous group

  while (true) {
    let kthNode = prevGroupEnd;

    // Find the k-th node from the current position
    for (let i = 0; i < k; i++) {
      kthNode = kthNode.next;
      if (!kthNode) return dummy.next; // If there are fewer than k nodes left, return the result
    }

    let groupStart = prevGroupEnd.next; // First node of the current k-group
    let nextGroupStart = kthNode.next; // Node after the k-th node (start of the next group)

    // Reverse the k nodes
    let prev = nextGroupStart; // This will be the new end of the reversed group
    let curr = groupStart;

    for (let i = 0; i < k; i++) {
      let temp = curr.next; // Store the next node
      curr.next = prev; // Reverse the current node
      prev = curr; // Move prev to current
      curr = temp; // Move to the next node
    }

    // Connect the previous group's end to the new head (prev)
    prevGroupEnd.next = prev;
    // Move prevGroupEnd to the end of the reversed group (which was the start before reversal)
    prevGroupEnd = groupStart;
  }
};
