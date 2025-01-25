/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val);
 *     this.next = (next===undefined ? null : next);
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var isPalindrome = function (head) {
  if (!head || !head.next) return true; // A single node or empty list is always a palindrome

  let fast = head,
    slow = head;

  // Step 1: Find the middle of the list
  while (fast && fast.next) {
    fast = fast.next.next;
    slow = slow.next;
  }

  // Step 2: Reverse the second half of the list
  slow = reverse(slow);
  fast = head;

  // Step 3: Compare the first half and the reversed second half
  while (slow) {
    if (slow.val !== fast.val) return false;
    slow = slow.next;
    fast = fast.next;
  }

  return true;
};

/**
 * Helper function to reverse a linked list
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverse = function (head) {
  let prev = null;

  while (head) {
    const next = head.next; // Save the next node
    head.next = prev; // Reverse the current node's pointer
    prev = head; // Move prev forward
    head = next; // Move to the next node
  }

  return prev; // New head of the reversed list
};
