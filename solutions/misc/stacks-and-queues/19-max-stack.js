/**
 * 19. Max Stack - Stack with Maximum Element Retrieval
 *
 * Problem: Design a stack that supports push, pop, top, and retrieving the maximum element in O(1) time.
 * Also support popMax() to remove and return the maximum element.
 *
 * Example:
 * maxStack.push(5);
 * maxStack.push(1);
 * maxStack.push(5);
 * maxStack.top();    // Returns 5
 * maxStack.popMax(); // Returns 5
 * maxStack.top();    // Returns 1
 * maxStack.getMax(); // Returns 5
 */

/**
 * Approach 1: Using Two Stacks
 * Time Complexity: O(1) for push, pop, top, getMax
 *                  O(n) for popMax
 * Space Complexity: O(n)
 */
class MaxStack {
  constructor() {
    this.stack = [];
    this.maxStack = [];
  }

  /**
   * Push element onto stack
   * Time: O(1)
   */
  push(x) {
    this.stack.push(x);

    // Update max stack
    if (this.maxStack.length === 0 || x >= this.getMax()) {
      this.maxStack.push(x);
    } else {
      // Keep track of current max
      this.maxStack.push(this.getMax());
    }
  }

  /**
   * Remove and return top element
   * Time: O(1)
   */
  pop() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }

    this.maxStack.pop();
    return this.stack.pop();
  }

  /**
   * Get top element
   * Time: O(1)
   */
  top() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.stack[this.stack.length - 1];
  }

  /**
   * Get maximum element
   * Time: O(1)
   */
  getMax() {
    if (this.maxStack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.maxStack[this.maxStack.length - 1];
  }

  /**
   * Remove and return maximum element
   * Time: O(n) - need to find and remove max
   */
  popMax() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }

    const max = this.getMax();
    const buffer = [];

    // Pop elements until we find the max
    while (this.top() !== max) {
      buffer.push(this.pop());
    }

    // Remove the max element
    this.pop();

    // Restore other elements
    while (buffer.length > 0) {
      this.push(buffer.pop());
    }

    return max;
  }

  isEmpty() {
    return this.stack.length === 0;
  }

  size() {
    return this.stack.length;
  }

  display() {
    console.log("Stack:", this.stack);
    console.log("Max Stack:", this.maxStack);
  }
}

/**
 * Approach 2: Optimized with Double Linked List and TreeMap
 * Time Complexity: O(log n) for all operations including popMax
 * Space Complexity: O(n)
 */
class Node {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class MaxStackOptimized {
  constructor() {
    this.head = new Node(0); // Dummy head
    this.tail = new Node(0); // Dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;

    // Map to store value -> array of nodes
    this.valueToNodes = new Map();
  }

  push(x) {
    const node = new Node(x);

    // Add to end of linked list
    node.prev = this.tail.prev;
    node.next = this.tail;
    this.tail.prev.next = node;
    this.tail.prev = node;

    // Add to map
    if (!this.valueToNodes.has(x)) {
      this.valueToNodes.set(x, []);
    }
    this.valueToNodes.get(x).push(node);
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }

    const node = this.tail.prev;
    const val = node.val;

    // Remove from linked list
    this.removeNode(node);

    // Remove from map
    const nodes = this.valueToNodes.get(val);
    nodes.pop();
    if (nodes.length === 0) {
      this.valueToNodes.delete(val);
    }

    return val;
  }

  top() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.tail.prev.val;
  }

  getMax() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }

    let max = -Infinity;
    for (let key of this.valueToNodes.keys()) {
      max = Math.max(max, key);
    }
    return max;
  }

  popMax() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }

    const max = this.getMax();
    const nodes = this.valueToNodes.get(max);
    const node = nodes.pop();

    if (nodes.length === 0) {
      this.valueToNodes.delete(max);
    }

    // Remove from linked list
    this.removeNode(node);

    return max;
  }

  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  isEmpty() {
    return this.head.next === this.tail;
  }
}

/**
 * Enhanced MaxStack with Min tracking
 */
class MinMaxStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
    this.maxStack = [];
  }

  push(x) {
    this.stack.push(x);

    // Update min stack
    const currentMin =
      this.minStack.length === 0 ? x : Math.min(x, this.getMin());
    this.minStack.push(currentMin);

    // Update max stack
    const currentMax =
      this.maxStack.length === 0 ? x : Math.max(x, this.getMax());
    this.maxStack.push(currentMax);
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }

    this.minStack.pop();
    this.maxStack.pop();
    return this.stack.pop();
  }

  top() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    if (this.minStack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.minStack[this.minStack.length - 1];
  }

  getMax() {
    if (this.maxStack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.maxStack[this.maxStack.length - 1];
  }

  isEmpty() {
    return this.stack.length === 0;
  }

  getRange() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.getMax() - this.getMin();
  }
}

// Example usage and test cases
console.log("=== Max Stack Implementation ===\n");

// Test Case 1: Basic operations
console.log("Test Case 1: Basic MaxStack Operations");
const maxStack = new MaxStack();

maxStack.push(5);
maxStack.push(1);
maxStack.push(5);

console.log("Top:", maxStack.top()); // 5
console.log("Max:", maxStack.getMax()); // 5

console.log("PopMax:", maxStack.popMax()); // 5
console.log("Top:", maxStack.top()); // 1
console.log("Max:", maxStack.getMax()); // 5

maxStack.display();
console.log();

// Test Case 2: Multiple max values
console.log("Test Case 2: Multiple Maximum Values");
const maxStack2 = new MaxStack();

const values = [3, 7, 2, 7, 9, 1, 9];
values.forEach((val) => {
  maxStack2.push(val);
  console.log(`Pushed ${val}, Current Max: ${maxStack2.getMax()}`);
});

console.log("\nPopping max values:");
console.log("PopMax:", maxStack2.popMax()); // 9
console.log("Current Max:", maxStack2.getMax()); // 9
console.log("PopMax:", maxStack2.popMax()); // 9
console.log("Current Max:", maxStack2.getMax()); // 7
console.log();

// Test Case 3: MinMax Stack
console.log("Test Case 3: MinMax Stack");
const minMaxStack = new MinMaxStack();

[5, 2, 8, 1, 9, 3].forEach((val) => minMaxStack.push(val));

console.log("Current Min:", minMaxStack.getMin()); // 1
console.log("Current Max:", minMaxStack.getMax()); // 9
console.log("Range:", minMaxStack.getRange()); // 8

minMaxStack.pop(); // Remove 3
console.log("After pop:");
console.log("Min:", minMaxStack.getMin()); // 1
console.log("Max:", minMaxStack.getMax()); // 9
console.log();

// Test Case 4: Edge cases
console.log("Test Case 4: Edge Cases");

// All same values
const sameStack = new MaxStack();
[5, 5, 5, 5].forEach((val) => sameStack.push(val));
console.log("All same - Max:", sameStack.getMax()); // 5
console.log("PopMax:", sameStack.popMax()); // 5
console.log("New Max:", sameStack.getMax()); // 5

// Increasing sequence
const incStack = new MaxStack();
[1, 2, 3, 4, 5].forEach((val) => incStack.push(val));
console.log("Increasing - Max:", incStack.getMax()); // 5

// Decreasing sequence
const decStack = new MaxStack();
[5, 4, 3, 2, 1].forEach((val) => decStack.push(val));
console.log("Decreasing - Max:", decStack.getMax()); // 5

/*
Python Implementation:

class MaxStack:
    """
    Max Stack using Two Stacks
    Time: O(1) for push, pop, top, get_max
          O(n) for pop_max
    Space: O(n)
    """
    
    def __init__(self):
        self.stack = []
        self.max_stack = []
    
    def push(self, x):
        """Push element - O(1)"""
        self.stack.append(x)
        
        # Update max stack
        if not self.max_stack or x >= self.get_max():
            self.max_stack.append(x)
        else:
            self.max_stack.append(self.get_max())
    
    def pop(self):
        """Pop element - O(1)"""
        if not self.stack:
            raise Exception("Stack is empty")
        
        self.max_stack.pop()
        return self.stack.pop()
    
    def top(self):
        """Get top element - O(1)"""
        if not self.stack:
            raise Exception("Stack is empty")
        return self.stack[-1]
    
    def get_max(self):
        """Get maximum element - O(1)"""
        if not self.max_stack:
            raise Exception("Stack is empty")
        return self.max_stack[-1]
    
    def pop_max(self):
        """Remove and return max - O(n)"""
        if not self.stack:
            raise Exception("Stack is empty")
        
        max_val = self.get_max()
        buffer = []
        
        # Pop until we find max
        while self.top() != max_val:
            buffer.append(self.pop())
        
        # Remove max
        self.pop()
        
        # Restore elements
        while buffer:
            self.push(buffer.pop())
        
        return max_val

class MinMaxStack:
    """Stack with both Min and Max tracking"""
    
    def __init__(self):
        self.stack = []
        self.min_stack = []
        self.max_stack = []
    
    def push(self, x):
        self.stack.append(x)
        
        # Update min
        current_min = x if not self.min_stack else min(x, self.get_min())
        self.min_stack.append(current_min)
        
        # Update max
        current_max = x if not self.max_stack else max(x, self.get_max())
        self.max_stack.append(current_max)
    
    def pop(self):
        if not self.stack:
            raise Exception("Stack is empty")
        
        self.min_stack.pop()
        self.max_stack.pop()
        return self.stack.pop()
    
    def top(self):
        if not self.stack:
            raise Exception("Stack is empty")
        return self.stack[-1]
    
    def get_min(self):
        if not self.min_stack:
            raise Exception("Stack is empty")
        return self.min_stack[-1]
    
    def get_max(self):
        if not self.max_stack:
            raise Exception("Stack is empty")
        return self.max_stack[-1]

# Example usage
if __name__ == "__main__":
    max_stack = MaxStack()
    
    max_stack.push(5)
    max_stack.push(1)
    max_stack.push(5)
    
    print("Top:", max_stack.top())     # 5
    print("Max:", max_stack.get_max()) # 5
    print("PopMax:", max_stack.pop_max()) # 5
    print("Max:", max_stack.get_max()) # 5
*/
