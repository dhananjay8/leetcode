/**
 * Find Middle of Linked List
 *
 * Problem: Find the middle node of a linked list
 *
 * Approaches:
 * 1. Two pointers (slow and fast)
 * 2. Two pass (count then find middle)
 * Time Complexity: O(n), Space Complexity: O(1)
 */

// JavaScript Solution

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Approach 1: Two pointers (most efficient - one pass)
function middleNode(head) {
  let slow = head;
  let fast = head;

  // Fast moves 2x speed of slow
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // When fast reaches end, slow is at middle
  return slow;
}

// If even number of nodes, return first middle
function firstMiddleNode(head) {
  let slow = head;
  let fast = head;

  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  return slow;
}

// Approach 2: Two pass - count then find
function middleNodeTwoPass(head) {
  // First pass: count nodes
  let count = 0;
  let current = head;

  while (current !== null) {
    count++;
    current = current.next;
  }

  // Second pass: go to middle
  const mid = Math.floor(count / 2);
  current = head;

  for (let i = 0; i < mid; i++) {
    current = current.next;
  }

  return current;
}

// Delete middle node
function deleteMiddle(head) {
  if (head === null || head.next === null) {
    return null;
  }

  let slow = head;
  let fast = head;
  let prev = null;

  while (fast !== null && fast.next !== null) {
    prev = slow;
    slow = slow.next;
    fast = fast.next.next;
  }

  // Delete middle node
  if (prev !== null) {
    prev.next = slow.next;
  }

  return head;
}

// Get middle value
function getMiddleValue(head) {
  const middle = middleNode(head);
  return middle ? middle.val : null;
}

// Helper functions
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
console.log(middleNode(list1).val); // 3

const list2 = createLinkedList([1, 2, 3, 4, 5, 6]);
console.log(middleNode(list2).val); // 4
console.log(firstMiddleNode(list2).val); // 3

const list3 = createLinkedList([1, 2, 3, 4, 5]);
const afterDelete = deleteMiddle(list3);
console.log(linkedListToArray(afterDelete)); // [1, 2, 4, 5]

/*
Python Solution:

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def middle_node(head):
    """
    Find middle node using two pointers
    
    Args:
        head: Head of linked list
    Returns:
        Middle node
    """
    slow = head
    fast = head
    
    # Fast moves 2x speed of slow
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    
    # When fast reaches end, slow is at middle
    return slow

def first_middle_node(head):
    """If even nodes, return first middle"""
    slow = head
    fast = head
    
    while fast.next is not None and fast.next.next is not None:
        slow = slow.next
        fast = fast.next.next
    
    return slow

def middle_node_two_pass(head):
    """Two pass approach - count then find"""
    # First pass: count nodes
    count = 0
    current = head
    
    while current is not None:
        count += 1
        current = current.next
    
    # Second pass: go to middle
    mid = count // 2
    current = head
    
    for i in range(mid):
        current = current.next
    
    return current

def delete_middle(head):
    """Delete middle node"""
    if head is None or head.next is None:
        return None
    
    slow = head
    fast = head
    prev = None
    
    while fast is not None and fast.next is not None:
        prev = slow
        slow = slow.next
        fast = fast.next.next
    
    # Delete middle node
    if prev is not None:
        prev.next = slow.next
    
    return head

def get_middle_value(head):
    """Get middle value"""
    middle = middle_node(head)
    return middle.val if middle else None

def create_linked_list(arr):
    """Helper to create linked list"""
    if not arr:
        return None
    head = ListNode(arr[0])
    current = head
    for i in range(1, len(arr)):
        current.next = ListNode(arr[i])
        current = current.next
    return head

def linked_list_to_array(head):
    """Helper to convert to array"""
    result = []
    current = head
    while current is not None:
        result.append(current.val)
        current = current.next
    return result

# Example usage
list1 = create_linked_list([1, 2, 3, 4, 5])
print(middle_node(list1).val)  # 3

list2 = create_linked_list([1, 2, 3, 4, 5, 6])
print(middle_node(list2).val)  # 4
print(first_middle_node(list2).val)  # 3

list3 = create_linked_list([1, 2, 3, 4, 5])
after_delete = delete_middle(list3)
print(linked_list_to_array(after_delete))  # [1, 2, 4, 5]
*/

module.exports = {
  ListNode,
  middleNode,
  firstMiddleNode,
  middleNodeTwoPass,
  deleteMiddle,
  getMiddleValue,
  createLinkedList,
  linkedListToArray,
};
