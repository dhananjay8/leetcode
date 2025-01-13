// Definition for a singly-linked list node
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val; // Value of the node
    this.next = next; // Pointer to the next node
  }
}

// Linked List Class
class LinkedList {
  constructor() {
    this.head = null; // Head of the linked list
  }

  // Add a node to the end of the linked list
  append(val) {
    const newNode = new ListNode(val);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }

  // Print the linked list values
  printList() {
    let current = this.head;
    const values = [];
    while (current) {
      values.push(current.val);
      current = current.next;
    }
    console.log(values.join(" -> "));
  }

  // Convert linked list to array
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.val);
      current = current.next;
    }
    return result;
  }

  // Get the length of the linked list
  length() {
    let count = 0;
    let current = this.head;
    while (current) {
      count++;
      current = current.next;
    }
    return count;
  }
}

// Example usage:
const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.printList(); // Output: 1 -> 2 -> 3
console.log(list.toArray()); // Output: [1, 2, 3]
console.log("Length:", list.length()); // Output: Length: 3

// -----------PYTHON-------------------------PYTHON--------------
// class ListNode:
//     def __init__(self, val=0, next=None):
//         self.val = val
//         self.next = next

// class LinkedList:
//     def __init__(self):
//         self.head = None

//     # Append a value to the end of the linked list
//     def append(self, val):
//         new_node = ListNode(val)
//         if not self.head:
//             self.head = new_node
//             return
//         current = self.head
//         while current.next:
//             current = current.next
//         current.next = new_node

//     # Print the linked list
//     def print_list(self):
//         current = self.head
//         values = []
//         while current:
//             values.append(current.val)
//             current = current.next
//         print(" -> ".join(map(str, values)))

//     # Convert linked list to an array
//     def to_array(self):
//         result = []
//         current = self.head
//         while current:
//             result.append(current.val)
//             current = current.next
//         return result

// # Example usage:
// ll = LinkedList()
// ll.append(1)
// ll.append(2)
// ll.append(3)
// ll.print_list()  # Output: 1 -> 2 -> 3
// print(ll.to_array())  # Output: [1, 2, 3]
