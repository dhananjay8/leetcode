/**
 * Problem: Sort List
 * Link: https://leetcode.com/problems/sort-list/
 * Difficulty: Medium
 *
 * Sort a linked list in O(n log n) time and O(1) space.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(log n) recursion stack
 */

// JavaScript Solution — Merge Sort on Linked List
function sortList(head) {
  if (!head || !head.next) return head;

  // Find middle using slow/fast pointers
  let slow = head, fast = head.next;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }

  const mid = slow.next;
  slow.next = null; // split into two halves

  const left = sortList(head);
  const right = sortList(mid);
  return mergeTwoLists(left, right);
}

function mergeTwoLists(l1, l2) {
  const dummy = { next: null };
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }
  curr.next = l1 || l2;
  return dummy.next;
}

module.exports = sortList;

/* Python Solution:

def sortList(head):
    if not head or not head.next: return head
    
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    mid = slow.next
    slow.next = None
    
    left, right = sortList(head), sortList(mid)
    
    dummy = ListNode(0)
    curr = dummy
    while left and right:
        if left.val <= right.val: curr.next = left; left = left.next
        else: curr.next = right; right = right.next
        curr = curr.next
    curr.next = left or right
    return dummy.next

*/
