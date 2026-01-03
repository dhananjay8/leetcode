/**
 * 15. Find the Intersection Point of Two Linked Lists
 *
 * Problem: Given two singly linked lists, find the node at which the two lists intersect.
 * If the two linked lists have no intersection, return null.
 *
 * Example:
 * List A: 4 -> 1 -> 8 -> 4 -> 5
 * List B:      5 -> 6 -> 1 -> 8 -> 4 -> 5
 * Intersection at node with value 8
 */

// ListNode class definition
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * Approach 1: Two Pointers (Optimal)
 * Time Complexity: O(m + n) where m and n are lengths of the lists
 * Space Complexity: O(1)
 *
 * Key Insight: When two pointers traverse both lists, they will meet at intersection
 * or both reach null at the same time if no intersection exists.
 */
function getIntersectionNode(headA, headB) {
  if (!headA || !headB) return null;

  let ptrA = headA;
  let ptrB = headB;

  // Traverse both lists
  // When reaching end of one list, continue from head of other list
  // They will meet at intersection or both become null
  while (ptrA !== ptrB) {
    ptrA = ptrA === null ? headB : ptrA.next;
    ptrB = ptrB === null ? headA : ptrB.next;
  }

  return ptrA; // Returns intersection node or null
}

/**
 * Approach 2: Using Length Difference
 * Time Complexity: O(m + n)
 * Space Complexity: O(1)
 */
function getIntersectionNodeByLength(headA, headB) {
  if (!headA || !headB) return null;

  // Calculate lengths of both lists
  let lenA = getLength(headA);
  let lenB = getLength(headB);

  // Align the starting points
  let ptrA = headA;
  let ptrB = headB;

  if (lenA > lenB) {
    ptrA = advanceBy(ptrA, lenA - lenB);
  } else {
    ptrB = advanceBy(ptrB, lenB - lenA);
  }

  // Move both pointers together until they meet
  while (ptrA !== ptrB) {
    ptrA = ptrA.next;
    ptrB = ptrB.next;
  }

  return ptrA;
}

// Helper function to get length of linked list
function getLength(head) {
  let length = 0;
  let current = head;

  while (current !== null) {
    length++;
    current = current.next;
  }

  return length;
}

// Helper function to advance pointer by n steps
function advanceBy(head, n) {
  let current = head;

  for (let i = 0; i < n; i++) {
    current = current.next;
  }

  return current;
}

/**
 * Approach 3: Using Hash Set
 * Time Complexity: O(m + n)
 * Space Complexity: O(m) or O(n) - storing one list in hash set
 */
function getIntersectionNodeHashSet(headA, headB) {
  if (!headA || !headB) return null;

  const visited = new Set();

  // Store all nodes from list A in hash set
  let current = headA;
  while (current !== null) {
    visited.add(current);
    current = current.next;
  }

  // Check each node in list B
  current = headB;
  while (current !== null) {
    if (visited.has(current)) {
      return current;
    }
    current = current.next;
  }

  return null;
}

/**
 * Approach 4: Using Cycle Detection (Floyd's Algorithm)
 * Time Complexity: O(m + n)
 * Space Complexity: O(1)
 */
function getIntersectionNodeCycle(headA, headB) {
  if (!headA || !headB) return null;

  // Connect end of list A to head of list B to create a cycle
  let tailA = headA;
  while (tailA.next !== null) {
    tailA = tailA.next;
  }

  // Temporarily create cycle
  tailA.next = headB;

  // Use Floyd's cycle detection to find start of cycle
  let slow = headA;
  let fast = headA;

  // Detect if cycle exists
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      break;
    }
  }

  // If no cycle, no intersection
  if (fast === null || fast.next === null) {
    tailA.next = null; // Restore original structure
    return null;
  }

  // Find start of cycle (intersection point)
  slow = headA;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }

  // Restore original structure
  tailA.next = null;

  return slow;
}

// Helper function to create a linked list from array
function createLinkedList(arr) {
  if (!arr || arr.length === 0) return null;

  const head = new ListNode(arr[0]);
  let current = head;

  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }

  return head;
}

// Helper function to create intersecting lists
function createIntersectingLists() {
  // Create common part: 8 -> 4 -> 5
  const common = createLinkedList([8, 4, 5]);

  // Create list A: 4 -> 1 -> [common]
  const headA = new ListNode(4);
  headA.next = new ListNode(1);
  headA.next.next = common;

  // Create list B: 5 -> 6 -> 1 -> [common]
  const headB = new ListNode(5);
  headB.next = new ListNode(6);
  headB.next.next = new ListNode(1);
  headB.next.next.next = common;

  return { headA, headB, intersection: common };
}

// Helper function to print linked list
function printList(head, maxNodes = 20) {
  const result = [];
  let current = head;
  let count = 0;

  while (current !== null && count < maxNodes) {
    result.push(current.val);
    current = current.next;
    count++;
  }

  if (current !== null) {
    result.push("...");
  }

  console.log(result.join(" -> "));
}

// Example usage and test cases
console.log("=== Find Intersection Point of Two Linked Lists ===\n");

// Test Case 1: Lists with intersection
console.log("Test Case 1: Lists with intersection");
const {
  headA: list1A,
  headB: list1B,
  intersection: int1,
} = createIntersectingLists();
console.log("List A:");
printList(list1A);
console.log("List B:");
printList(list1B);

const result1 = getIntersectionNode(list1A, list1B);
console.log("Intersection value:", result1 ? result1.val : null);
console.log("Same node?", result1 === int1);
console.log();

// Test Case 2: Lists without intersection
console.log("Test Case 2: Lists without intersection");
const list2A = createLinkedList([1, 2, 3]);
const list2B = createLinkedList([4, 5, 6]);
console.log("List A:");
printList(list2A);
console.log("List B:");
printList(list2B);

const result2 = getIntersectionNode(list2A, list2B);
console.log("Intersection:", result2);
console.log();

// Test Case 3: Different approach - Length difference
console.log("Test Case 3: Using length difference approach");
const { headA: list3A, headB: list3B } = createIntersectingLists();
const result3 = getIntersectionNodeByLength(list3A, list3B);
console.log("Intersection value:", result3 ? result3.val : null);
console.log();

// Test Case 4: Using hash set approach
console.log("Test Case 4: Using hash set approach");
const { headA: list4A, headB: list4B } = createIntersectingLists();
const result4 = getIntersectionNodeHashSet(list4A, list4B);
console.log("Intersection value:", result4 ? result4.val : null);

/*
Python Implementation:

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def get_intersection_node(headA, headB):
    """
    Approach 1: Two Pointers (Optimal)
    Time Complexity: O(m + n)
    Space Complexity: O(1)
    """
    if not headA or not headB:
        return None
    
    ptrA = headA
    ptrB = headB
    
    # Traverse both lists
    while ptrA != ptrB:
        ptrA = headB if ptrA is None else ptrA.next
        ptrB = headA if ptrB is None else ptrB.next
    
    return ptrA

def get_intersection_node_by_length(headA, headB):
    """
    Approach 2: Using Length Difference
    Time Complexity: O(m + n)
    Space Complexity: O(1)
    """
    if not headA or not headB:
        return None
    
    # Calculate lengths
    def get_length(head):
        length = 0
        current = head
        while current:
            length += 1
            current = current.next
        return length
    
    lenA = get_length(headA)
    lenB = get_length(headB)
    
    # Align starting points
    ptrA, ptrB = headA, headB
    
    if lenA > lenB:
        for _ in range(lenA - lenB):
            ptrA = ptrA.next
    else:
        for _ in range(lenB - lenA):
            ptrB = ptrB.next
    
    # Move together until they meet
    while ptrA != ptrB:
        ptrA = ptrA.next
        ptrB = ptrB.next
    
    return ptrA

def get_intersection_node_hash_set(headA, headB):
    """
    Approach 3: Using Hash Set
    Time Complexity: O(m + n)
    Space Complexity: O(m)
    """
    if not headA or not headB:
        return None
    
    visited = set()
    
    # Store all nodes from list A
    current = headA
    while current:
        visited.add(current)
        current = current.next
    
    # Check each node in list B
    current = headB
    while current:
        if current in visited:
            return current
        current = current.next
    
    return None

def create_linked_list(arr):
    """Helper function to create linked list from array"""
    if not arr:
        return None
    
    head = ListNode(arr[0])
    current = head
    
    for i in range(1, len(arr)):
        current.next = ListNode(arr[i])
        current = current.next
    
    return head

# Example usage
if __name__ == "__main__":
    # Create intersecting lists
    # Common part
    common = create_linked_list([8, 4, 5])
    
    # List A: 4 -> 1 -> common
    headA = ListNode(4)
    headA.next = ListNode(1)
    headA.next.next = common
    
    # List B: 5 -> 6 -> 1 -> common
    headB = ListNode(5)
    headB.next = ListNode(6)
    headB.next.next = ListNode(1)
    headB.next.next.next = common
    
    # Find intersection
    result = get_intersection_node(headA, headB)
    print("Intersection value:", result.val if result else None)  # 8
*/
