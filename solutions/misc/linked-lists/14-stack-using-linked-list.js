/**
 * 14. Implement a Stack using Linked List
 *
 * Problem: Implement a stack data structure using a linked list.
 * Support push, pop, top, and isEmpty operations.
 *
 * Stack follows LIFO (Last In First Out) principle
 */

// Node class for the linked list
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

/**
 * Stack Implementation using Linked List
 * All operations: O(1) time complexity
 * Space Complexity: O(n) where n is number of elements
 */
class Stack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  /**
   * Push an element onto the stack
   * Time Complexity: O(1)
   */
  push(data) {
    const newNode = new Node(data);
    newNode.next = this.top;
    this.top = newNode;
    this.size++;
  }

  /**
   * Remove and return the top element
   * Time Complexity: O(1)
   */
  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack Underflow: Cannot pop from empty stack");
    }

    const poppedData = this.top.data;
    this.top = this.top.next;
    this.size--;
    return poppedData;
  }

  /**
   * Return the top element without removing it
   * Time Complexity: O(1)
   */
  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.top.data;
  }

  /**
   * Check if stack is empty
   * Time Complexity: O(1)
   */
  isEmpty() {
    return this.top === null;
  }

  /**
   * Get the size of the stack
   * Time Complexity: O(1)
   */
  getSize() {
    return this.size;
  }

  /**
   * Clear the stack
   * Time Complexity: O(1)
   */
  clear() {
    this.top = null;
    this.size = 0;
  }

  /**
   * Display stack elements
   * Time Complexity: O(n)
   */
  display() {
    if (this.isEmpty()) {
      console.log("Stack is empty");
      return;
    }

    const elements = [];
    let current = this.top;

    while (current !== null) {
      elements.push(current.data);
      current = current.next;
    }

    console.log("Stack (top to bottom):", elements.join(" -> "));
  }

  /**
   * Convert stack to array
   * Time Complexity: O(n)
   */
  toArray() {
    const result = [];
    let current = this.top;

    while (current !== null) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Search for an element in the stack
   * Returns position from top (1-indexed), -1 if not found
   * Time Complexity: O(n)
   */
  search(data) {
    let current = this.top;
    let position = 1;

    while (current !== null) {
      if (current.data === data) {
        return position;
      }
      current = current.next;
      position++;
    }

    return -1;
  }
}

/**
 * Advanced Stack with Min/Max tracking
 * Supports getMin() and getMax() in O(1) time
 */
class MinMaxStack {
  constructor() {
    this.stack = new Stack();
    this.minStack = new Stack();
    this.maxStack = new Stack();
  }

  push(data) {
    this.stack.push(data);

    // Update min stack
    if (this.minStack.isEmpty() || data <= this.minStack.peek()) {
      this.minStack.push(data);
    }

    // Update max stack
    if (this.maxStack.isEmpty() || data >= this.maxStack.peek()) {
      this.maxStack.push(data);
    }
  }

  pop() {
    if (this.stack.isEmpty()) {
      throw new Error("Stack is empty");
    }

    const popped = this.stack.pop();

    if (popped === this.minStack.peek()) {
      this.minStack.pop();
    }

    if (popped === this.maxStack.peek()) {
      this.maxStack.pop();
    }

    return popped;
  }

  peek() {
    return this.stack.peek();
  }

  getMin() {
    if (this.minStack.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.minStack.peek();
  }

  getMax() {
    if (this.maxStack.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.maxStack.peek();
  }

  isEmpty() {
    return this.stack.isEmpty();
  }
}

// Example usage and test cases
console.log("=== Stack Implementation using Linked List ===\n");

// Test Case 1: Basic operations
console.log("Test Case 1: Basic Stack Operations");
const stack = new Stack();

stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);
stack.display(); // 40 -> 30 -> 20 -> 10

console.log("Peek:", stack.peek()); // 40
console.log("Size:", stack.getSize()); // 4

console.log("Popped:", stack.pop()); // 40
console.log("Popped:", stack.pop()); // 30
stack.display(); // 20 -> 10

console.log("Search 20:", stack.search(20)); // 1
console.log("Search 10:", stack.search(10)); // 2
console.log("Search 99:", stack.search(99)); // -1
console.log();

// Test Case 2: String stack
console.log("Test Case 2: String Stack");
const stringStack = new Stack();

stringStack.push("Hello");
stringStack.push("World");
stringStack.push("Stack");
stringStack.display();

console.log("Peek:", stringStack.peek());
stringStack.pop();
stringStack.display();
console.log();

// Test Case 3: MinMax Stack
console.log("Test Case 3: MinMax Stack");
const minMaxStack = new MinMaxStack();

minMaxStack.push(5);
minMaxStack.push(2);
minMaxStack.push(8);
minMaxStack.push(1);
minMaxStack.push(9);

console.log("Current min:", minMaxStack.getMin()); // 1
console.log("Current max:", minMaxStack.getMax()); // 9

minMaxStack.pop(); // Remove 9
console.log("After popping 9:");
console.log("Current min:", minMaxStack.getMin()); // 1
console.log("Current max:", minMaxStack.getMax()); // 8

minMaxStack.pop(); // Remove 1
console.log("After popping 1:");
console.log("Current min:", minMaxStack.getMin()); // 2
console.log("Current max:", minMaxStack.getMax()); // 8
console.log();

// Test Case 4: Empty stack handling
console.log("Test Case 4: Empty Stack Error Handling");
const emptyStack = new Stack();
console.log("Is empty:", emptyStack.isEmpty()); // true

try {
  emptyStack.pop();
} catch (error) {
  console.log("Error:", error.message);
}

try {
  emptyStack.peek();
} catch (error) {
  console.log("Error:", error.message);
}

/*
Python Implementation:

class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class Stack:
    """
    Stack Implementation using Linked List
    All operations: O(1) time complexity
    Space Complexity: O(n) where n is number of elements
    """
    
    def __init__(self):
        self.top = None
        self.size = 0
    
    def push(self, data):
        """
        Push an element onto the stack
        Time Complexity: O(1)
        """
        new_node = Node(data)
        new_node.next = self.top
        self.top = new_node
        self.size += 1
    
    def pop(self):
        """
        Remove and return the top element
        Time Complexity: O(1)
        """
        if self.is_empty():
            raise Exception("Stack Underflow: Cannot pop from empty stack")
        
        popped_data = self.top.data
        self.top = self.top.next
        self.size -= 1
        return popped_data
    
    def peek(self):
        """
        Return the top element without removing it
        Time Complexity: O(1)
        """
        if self.is_empty():
            raise Exception("Stack is empty")
        return self.top.data
    
    def is_empty(self):
        """
        Check if stack is empty
        Time Complexity: O(1)
        """
        return self.top is None
    
    def get_size(self):
        """
        Get the size of the stack
        Time Complexity: O(1)
        """
        return self.size
    
    def clear(self):
        """
        Clear the stack
        Time Complexity: O(1)
        """
        self.top = None
        self.size = 0
    
    def display(self):
        """
        Display stack elements
        Time Complexity: O(n)
        """
        if self.is_empty():
            print("Stack is empty")
            return
        
        elements = []
        current = self.top
        
        while current:
            elements.append(str(current.data))
            current = current.next
        
        print("Stack (top to bottom):", " -> ".join(elements))
    
    def search(self, data):
        """
        Search for an element in the stack
        Returns position from top (1-indexed), -1 if not found
        Time Complexity: O(n)
        """
        current = self.top
        position = 1
        
        while current:
            if current.data == data:
                return position
            current = current.next
            position += 1
        
        return -1

class MinMaxStack:
    """
    Advanced Stack with Min/Max tracking
    Supports get_min() and get_max() in O(1) time
    """
    
    def __init__(self):
        self.stack = Stack()
        self.min_stack = Stack()
        self.max_stack = Stack()
    
    def push(self, data):
        self.stack.push(data)
        
        # Update min stack
        if self.min_stack.is_empty() or data <= self.min_stack.peek():
            self.min_stack.push(data)
        
        # Update max stack
        if self.max_stack.is_empty() or data >= self.max_stack.peek():
            self.max_stack.push(data)
    
    def pop(self):
        if self.stack.is_empty():
            raise Exception("Stack is empty")
        
        popped = self.stack.pop()
        
        if popped == self.min_stack.peek():
            self.min_stack.pop()
        
        if popped == self.max_stack.peek():
            self.max_stack.pop()
        
        return popped
    
    def peek(self):
        return self.stack.peek()
    
    def get_min(self):
        if self.min_stack.is_empty():
            raise Exception("Stack is empty")
        return self.min_stack.peek()
    
    def get_max(self):
        if self.max_stack.is_empty():
            raise Exception("Stack is empty")
        return self.max_stack.peek()
    
    def is_empty(self):
        return self.stack.is_empty()

# Example usage
if __name__ == "__main__":
    # Test basic stack
    stack = Stack()
    stack.push(10)
    stack.push(20)
    stack.push(30)
    stack.display()  # 30 -> 20 -> 10
    
    print("Peek:", stack.peek())  # 30
    print("Popped:", stack.pop())  # 30
    stack.display()  # 20 -> 10
*/
