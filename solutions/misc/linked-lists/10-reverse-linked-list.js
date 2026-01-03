/**
 * Reverse a Linked List
 *
 * Problem: Reverse a singly linked list
 *
 * Approaches:
 * 1. Iterative (most common)
 * 2. Recursive
 * Time Complexity: O(n), Space Complexity: O(1) iterative, O(n) recursive
 */

// Node class definition
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// JavaScript Solution

// Approach 1: Iterative (most efficient)
function reverseList(head) {
  let prev = null;
  let current = head;

  while (current !== null) {
    // Save next node
    const nextTemp = current.next;
    // Reverse the link
    current.next = prev;
    // Move pointers forward
    prev = current;
    current = nextTemp;
  }

  return prev; // New head
}

// Approach 2: Recursive
function reverseListRecursive(head) {
  // Base case: empty list or single node
  if (head === null || head.next === null) {
    return head;
  }

  // Recursively reverse the rest of the list
  const newHead = reverseListRecursive(head.next);

  // Reverse the link
  head.next.next = head;
  head.next = null;

  return newHead;
}

// Reverse between positions m and n
function reverseBetween(head, m, n) {
  if (head === null || m === n) return head;

  const dummy = new ListNode(0);
  dummy.next = head;
  let prev = dummy;

  // Move to position m-1
  for (let i = 1; i < m; i++) {
    prev = prev.next;
  }

  // Reverse from m to n
  let current = prev.next;
  for (let i = 0; i < n - m; i++) {
    const nextTemp = current.next;
    current.next = nextTemp.next;
    nextTemp.next = prev.next;
    prev.next = nextTemp;
  }

  return dummy.next;
}

// Helper function to create linked list from array
function createLinkedList(arr) {
  if (arr.length === 0) return null;

  const head = new ListNode(arr[0]);
  let current = head;

  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }

  return head;
}

// Helper function to convert linked list to array
function linkedListToArray(head) {
  const result = [];
  let current = head;

  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }

  return result;
}

// Example usage
const list1 = createLinkedList([1, 2, 3, 4, 5]);
const reversed1 = reverseList(list1);
console.log(linkedListToArray(reversed1)); // [5, 4, 3, 2, 1]

const list2 = createLinkedList([1, 2, 3, 4, 5]);
const reversed2 = reverseListRecursive(list2);
console.log(linkedListToArray(reversed2)); // [5, 4, 3, 2, 1]

const list3 = createLinkedList([1, 2, 3, 4, 5]);
const reversed3 = reverseBetween(list3, 2, 4);
console.log(linkedListToArray(reversed3)); // [1, 4, 3, 2, 5]

/*
Python Solution:

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    """
    Reverse a linked list iteratively
    
    Args:
        head: Head of linked list
    Returns:
        New head of reversed list
    """
    prev = None
    current = head
    
    while current is not None:
        # Save next node
        next_temp = current.next
        # Reverse the link
        current.next = prev
        # Move pointers forward
        prev = current
        current = next_temp
    
    return prev  # New head

def reverse_list_recursive(head):
    """Reverse a linked list recursively"""
    # Base case
    if head is None or head.next is None:
        return head
    
    # Recursively reverse the rest
    new_head = reverse_list_recursive(head.next)
    
    # Reverse the link
    head.next.next = head
    head.next = None
    
    return new_head

def reverse_between(head, m, n):
    """Reverse linked list between positions m and n"""
    if head is None or m == n:
        return head
    
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy
    
    # Move to position m-1
    for i in range(1, m):
        prev = prev.next
    
    # Reverse from m to n
    current = prev.next
    for i in range(n - m):
        next_temp = current.next
        current.next = next_temp.next
        next_temp.next = prev.next
        prev.next = next_temp
    
    return dummy.next

def create_linked_list(arr):
    """Create linked list from array"""
    if not arr:
        return None
    
    head = ListNode(arr[0])
    current = head
    
    for i in range(1, len(arr)):
        current.next = ListNode(arr[i])
        current = current.next
    
    return head

def linked_list_to_array(head):
    """Convert linked list to array"""
    result = []
    current = head
    
    while current is not None:
        result.append(current.val)
        current = current.next
    
    return result

# Example usage
list1 = create_linked_list([1, 2, 3, 4, 5])
reversed1 = reverse_list(list1)
print(linked_list_to_array(reversed1))  # [5, 4, 3, 2, 1]

list2 = create_linked_list([1, 2, 3, 4, 5])
reversed2 = reverse_list_recursive(list2)
print(linked_list_to_array(reversed2))  # [5, 4, 3, 2, 1]

list3 = create_linked_list([1, 2, 3, 4, 5])
reversed3 = reverse_between(list3, 2, 4)
print(linked_list_to_array(reversed3))  # [1, 4, 3, 2, 5]
*/

module.exports = {
  ListNode,
  reverseList,
  reverseListRecursive,
  reverseBetween,
  createLinkedList,
  linkedListToArray,
};
