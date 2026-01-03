/**
 * 13. Merge Two Sorted Linked Lists
 *
 * Problem: Merge two sorted linked lists and return it as a sorted list.
 * The list should be made by splicing together the nodes of the first two lists.
 *
 * Example:
 * Input: list1 = [1,2,4], list2 = [1,3,4]
 * Output: [1,1,2,3,4,4]
 */

// ListNode class definition
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

/**
 * Approach 1: Iterative with Dummy Node
 * Time Complexity: O(n + m) where n and m are lengths of the two lists
 * Space Complexity: O(1) - only using pointers
 */
function mergeTwoLists(list1, list2) {
  // Create a dummy node to simplify edge cases
  const dummy = new ListNode(-1);
  let current = dummy;

  // Compare nodes from both lists and append smaller one
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }

  // Append remaining nodes from either list
  current.next = list1 !== null ? list1 : list2;

  return dummy.next;
}

/**
 * Approach 2: Recursive Solution
 * Time Complexity: O(n + m)
 * Space Complexity: O(n + m) - recursion stack
 */
function mergeTwoListsRecursive(list1, list2) {
  // Base cases
  if (list1 === null) return list2;
  if (list2 === null) return list1;

  // Recursive case
  if (list1.val <= list2.val) {
    list1.next = mergeTwoListsRecursive(list1.next, list2);
    return list1;
  } else {
    list2.next = mergeTwoListsRecursive(list1, list2.next);
    return list2;
  }
}

/**
 * Approach 3: In-place Merge (Optimized Iterative)
 * Time Complexity: O(n + m)
 * Space Complexity: O(1)
 */
function mergeTwoListsInPlace(list1, list2) {
  if (!list1) return list2;
  if (!list2) return list1;

  // Choose the smaller head as the result
  let head = list1.val <= list2.val ? list1 : list2;
  let current = head;

  // Update list pointers
  if (head === list1) {
    list1 = list1.next;
  } else {
    list2 = list2.next;
  }

  // Merge remaining nodes
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }

  // Attach remaining nodes
  current.next = list1 || list2;

  return head;
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

// Helper function to print linked list
function printLinkedList(head) {
  const arr = linkedListToArray(head);
  console.log(arr.join(" -> "));
}

// Example usage and test cases
console.log("=== Merge Two Sorted Linked Lists ===\n");

// Test Case 1: Normal case
const list1 = createLinkedList([1, 2, 4]);
const list2 = createLinkedList([1, 3, 4]);
console.log("Test Case 1:");
console.log("List 1:", linkedListToArray(list1));
console.log("List 2:", linkedListToArray(list2));
const merged1 = mergeTwoLists(list1, list2);
console.log("Merged:", linkedListToArray(merged1));
console.log();

// Test Case 2: One empty list
const list3 = createLinkedList([]);
const list4 = createLinkedList([0]);
console.log("Test Case 2:");
console.log("List 3:", linkedListToArray(list3));
console.log("List 4:", linkedListToArray(list4));
const merged2 = mergeTwoLists(list3, list4);
console.log("Merged:", linkedListToArray(merged2));
console.log();

// Test Case 3: Both empty lists
const list5 = createLinkedList([]);
const list6 = createLinkedList([]);
console.log("Test Case 3:");
console.log("List 5:", linkedListToArray(list5));
console.log("List 6:", linkedListToArray(list6));
const merged3 = mergeTwoLists(list5, list6);
console.log("Merged:", linkedListToArray(merged3));
console.log();

// Test Case 4: Different lengths
const list7 = createLinkedList([1, 3, 5, 7]);
const list8 = createLinkedList([2, 4]);
console.log("Test Case 4:");
console.log("List 7:", linkedListToArray(list7));
console.log("List 8:", linkedListToArray(list8));
const merged4 = mergeTwoListsRecursive(list7, list8);
console.log("Merged (Recursive):", linkedListToArray(merged4));

/*
Python Implementation:

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_two_lists(list1, list2):
    """
    Approach 1: Iterative with Dummy Node
    Time Complexity: O(n + m)
    Space Complexity: O(1)
    """
    # Create dummy node
    dummy = ListNode(-1)
    current = dummy
    
    # Merge lists
    while list1 and list2:
        if list1.val <= list2.val:
            current.next = list1
            list1 = list1.next
        else:
            current.next = list2
            list2 = list2.next
        current = current.next
    
    # Attach remaining nodes
    current.next = list1 if list1 else list2
    
    return dummy.next

def merge_two_lists_recursive(list1, list2):
    """
    Approach 2: Recursive Solution
    Time Complexity: O(n + m)
    Space Complexity: O(n + m) - recursion stack
    """
    # Base cases
    if not list1:
        return list2
    if not list2:
        return list1
    
    # Recursive case
    if list1.val <= list2.val:
        list1.next = merge_two_lists_recursive(list1.next, list2)
        return list1
    else:
        list2.next = merge_two_lists_recursive(list1, list2.next)
        return list2

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

def linked_list_to_array(head):
    """Helper function to convert linked list to array"""
    result = []
    current = head
    
    while current:
        result.append(current.val)
        current = current.next
    
    return result

# Example usage
if __name__ == "__main__":
    # Test Case 1
    list1 = create_linked_list([1, 2, 4])
    list2 = create_linked_list([1, 3, 4])
    merged = merge_two_lists(list1, list2)
    print("Merged:", linked_list_to_array(merged))  # [1, 1, 2, 3, 4, 4]
    
    # Test Case 2
    list3 = create_linked_list([])
    list4 = create_linked_list([0])
    merged2 = merge_two_lists(list3, list4)
    print("Merged:", linked_list_to_array(merged2))  # [0]
*/
