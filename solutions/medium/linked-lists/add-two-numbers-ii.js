/**
 * Problem: Add Two Numbers II
 * Link: https://leetcode.com/problems/add-two-numbers-ii/
 * Difficulty: Medium
 *
 * Two non-empty linked lists represent two non-negative integers.
 * The most significant digit comes first. Add the two numbers and return the sum as a linked list.
 *
 * Example: l1 = [7,2,4,3], l2 = [5,6,4] => Output: [7,8,0,7]
 *
 * Time Complexity: O(n + m)
 * Space Complexity: O(n + m) for stacks
 */

function ListNode(val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
}

// JavaScript Solution - Using Stacks
function addTwoNumbers(l1, l2) {
  // Push all values onto stacks so we can process from least significant digit
  const stack1 = [];
  const stack2 = [];

  while (l1) {
    stack1.push(l1.val);
    l1 = l1.next;
  }
  while (l2) {
    stack2.push(l2.val);
    l2 = l2.next;
  }

  let carry = 0;
  let head = null;

  // Process digits from right to left using stacks
  while (stack1.length || stack2.length || carry) {
    const sum = (stack1.pop() || 0) + (stack2.pop() || 0) + carry;
    carry = Math.floor(sum / 10); // carry for next digit
    const node = new ListNode(sum % 10); // current digit
    node.next = head; // prepend to result list
    head = node;
  }

  return head;
}

module.exports = addTwoNumbers;

/* Python Solution:

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def addTwoNumbers(l1, l2):
    # Use stacks to reverse the order
    stack1, stack2 = [], []
    
    while l1:
        stack1.append(l1.val)
        l1 = l1.next
    while l2:
        stack2.append(l2.val)
        l2 = l2.next
    
    carry = 0
    head = None
    
    while stack1 or stack2 or carry:
        total = carry
        if stack1: total += stack1.pop()
        if stack2: total += stack2.pop()
        carry = total // 10
        node = ListNode(total % 10)
        node.next = head  # prepend node
        head = node
    
    return head

*/
