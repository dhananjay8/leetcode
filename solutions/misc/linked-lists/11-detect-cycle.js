/**
 * Detect Cycle in Linked List
 *
 * Problem: Determine if a linked list has a cycle
 *
 * Approaches:
 * 1. Floyd's Cycle Detection (Two pointers - tortoise and hare)
 * 2. Hash Set
 * Time Complexity: O(n), Space Complexity: O(1) for Floyd's, O(n) for hash set
 */

// JavaScript Solution

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Approach 1: Floyd's Cycle Detection (most efficient)
function hasCycle(head) {
  if (head === null || head.next === null) {
    return false;
  }

  let slow = head;
  let fast = head;

  // Move slow by 1, fast by 2
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    // Cycle detected
    if (slow === fast) {
      return true;
    }
  }

  return false;
}

// Find the node where cycle begins
function detectCycle(head) {
  if (head === null || head.next === null) {
    return null;
  }

  let slow = head;
  let fast = head;
  let hasCycleFlag = false;

  // Detect if cycle exists
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      hasCycleFlag = true;
      break;
    }
  }

  if (!hasCycleFlag) {
    return null;
  }

  // Find the start of the cycle
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }

  return slow; // Start of cycle
}

// Approach 2: Using Hash Set
function hasCycleHashSet(head) {
  const visited = new Set();
  let current = head;

  while (current !== null) {
    if (visited.has(current)) {
      return true;
    }
    visited.add(current);
    current = current.next;
  }

  return false;
}

// Find cycle length
function cycleLength(head) {
  if (head === null || head.next === null) {
    return 0;
  }

  let slow = head;
  let fast = head;

  // Detect cycle
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      // Count cycle length
      let length = 1;
      let temp = slow.next;

      while (temp !== slow) {
        length++;
        temp = temp.next;
      }

      return length;
    }
  }

  return 0;
}

// Remove cycle from linked list
function removeCycle(head) {
  if (head === null || head.next === null) {
    return head;
  }

  let slow = head;
  let fast = head;

  // Detect cycle
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      break;
    }
  }

  // No cycle
  if (fast === null || fast.next === null) {
    return head;
  }

  // Find start of cycle
  slow = head;
  while (slow.next !== fast.next) {
    slow = slow.next;
    fast = fast.next;
  }

  // Remove cycle
  fast.next = null;

  return head;
}

// Example usage
const list1 = new ListNode(1);
list1.next = new ListNode(2);
list1.next.next = new ListNode(3);
list1.next.next.next = new ListNode(4);
list1.next.next.next.next = list1.next; // Create cycle

console.log(hasCycle(list1)); // true
console.log(cycleLength(list1)); // 3

const cycleStart = detectCycle(list1);
console.log(cycleStart ? cycleStart.val : null); // 2

/*
Python Solution:

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def has_cycle(head):
    """
    Detect cycle using Floyd's algorithm
    
    Args:
        head: Head of linked list
    Returns:
        Boolean indicating if cycle exists
    """
    if head is None or head.next is None:
        return False
    
    slow = head
    fast = head
    
    # Move slow by 1, fast by 2
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        
        # Cycle detected
        if slow == fast:
            return True
    
    return False

def detect_cycle(head):
    """Find the node where cycle begins"""
    if head is None or head.next is None:
        return None
    
    slow = head
    fast = head
    has_cycle_flag = False
    
    # Detect if cycle exists
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            has_cycle_flag = True
            break
    
    if not has_cycle_flag:
        return None
    
    # Find start of cycle
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    
    return slow

def has_cycle_hash_set(head):
    """Detect cycle using hash set"""
    visited = set()
    current = head
    
    while current is not None:
        if current in visited:
            return True
        visited.add(current)
        current = current.next
    
    return False

def cycle_length(head):
    """Find cycle length"""
    if head is None or head.next is None:
        return 0
    
    slow = head
    fast = head
    
    # Detect cycle
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            # Count cycle length
            length = 1
            temp = slow.next
            
            while temp != slow:
                length += 1
                temp = temp.next
            
            return length
    
    return 0

def remove_cycle(head):
    """Remove cycle from linked list"""
    if head is None or head.next is None:
        return head
    
    slow = head
    fast = head
    
    # Detect cycle
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:
            break
    
    # No cycle
    if fast is None or fast.next is None:
        return head
    
    # Find start of cycle
    slow = head
    while slow.next != fast.next:
        slow = slow.next
        fast = fast.next
    
    # Remove cycle
    fast.next = None
    
    return head

# Example usage
list1 = ListNode(1)
list1.next = ListNode(2)
list1.next.next = ListNode(3)
list1.next.next.next = ListNode(4)
list1.next.next.next.next = list1.next  # Create cycle

print(has_cycle(list1))  # True
print(cycle_length(list1))  # 3

cycle_start = detect_cycle(list1)
print(cycle_start.val if cycle_start else None)  # 2
*/

module.exports = {
  ListNode,
  hasCycle,
  detectCycle,
  hasCycleHashSet,
  cycleLength,
  removeCycle,
};
