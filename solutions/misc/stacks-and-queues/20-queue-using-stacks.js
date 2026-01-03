/**
 * 20. Design a Queue using Stacks
 *
 * Problem: Implement a queue using two stacks.
 * Support push (enqueue), pop (dequeue), peek, and empty operations.
 *
 * Queue follows FIFO (First In First Out) principle
 */

/**
 * Approach 1: Using Two Stacks (Push O(n), Pop O(1))
 * Time Complexity:
 *   - push: O(n) - transfer all elements
 *   - pop: O(1)
 *   - peek: O(1)
 * Space Complexity: O(n)
 */
class MyQueue {
  constructor() {
    this.stack1 = []; // Main stack
    this.stack2 = []; // Temporary stack
  }

  /**
   * Push element to the back of queue
   * Time: O(n)
   */
  push(x) {
    // Move all elements from stack1 to stack2
    while (this.stack1.length > 0) {
      this.stack2.push(this.stack1.pop());
    }

    // Push new element to stack1
    this.stack1.push(x);

    // Move all elements back from stack2 to stack1
    while (this.stack2.length > 0) {
      this.stack1.push(this.stack2.pop());
    }
  }

  /**
   * Remove element from front of queue
   * Time: O(1)
   */
  pop() {
    if (this.empty()) {
      throw new Error("Queue is empty");
    }
    return this.stack1.pop();
  }

  /**
   * Get front element
   * Time: O(1)
   */
  peek() {
    if (this.empty()) {
      throw new Error("Queue is empty");
    }
    return this.stack1[this.stack1.length - 1];
  }

  /**
   * Check if queue is empty
   * Time: O(1)
   */
  empty() {
    return this.stack1.length === 0;
  }

  size() {
    return this.stack1.length;
  }
}

/**
 * Approach 2: Using Two Stacks (Push O(1), Pop Amortized O(1))
 * More efficient approach
 * Time Complexity:
 *   - push: O(1)
 *   - pop: O(1) amortized
 *   - peek: O(1) amortized
 * Space Complexity: O(n)
 */
class MyQueueOptimized {
  constructor() {
    this.stackIn = []; // For push operations
    this.stackOut = []; // For pop operations
  }

  /**
   * Push element to the back of queue
   * Time: O(1)
   */
  push(x) {
    this.stackIn.push(x);
  }

  /**
   * Remove element from front of queue
   * Time: O(1) amortized
   */
  pop() {
    this.peek(); // Ensure stackOut has elements
    return this.stackOut.pop();
  }

  /**
   * Get front element
   * Time: O(1) amortized
   */
  peek() {
    if (this.empty()) {
      throw new Error("Queue is empty");
    }

    // Transfer elements from stackIn to stackOut if needed
    if (this.stackOut.length === 0) {
      while (this.stackIn.length > 0) {
        this.stackOut.push(this.stackIn.pop());
      }
    }

    return this.stackOut[this.stackOut.length - 1];
  }

  /**
   * Check if queue is empty
   * Time: O(1)
   */
  empty() {
    return this.stackIn.length === 0 && this.stackOut.length === 0;
  }

  size() {
    return this.stackIn.length + this.stackOut.length;
  }

  display() {
    // Show current state of both stacks
    console.log("StackIn (newest first):", this.stackIn);
    console.log("StackOut (oldest first):", this.stackOut.slice().reverse());
  }
}

/**
 * Approach 3: Using Single Stack (Recursive)
 * Time Complexity:
 *   - push: O(n)
 *   - pop: O(1)
 * Space Complexity: O(n) - recursion stack
 */
class MyQueueRecursive {
  constructor() {
    this.stack = [];
  }

  push(x) {
    this.pushHelper(x);
  }

  pushHelper(x) {
    if (this.stack.length === 0) {
      this.stack.push(x);
      return;
    }

    // Remove top element
    const temp = this.stack.pop();

    // Recursive call
    this.pushHelper(x);

    // Put back the element
    this.stack.push(temp);
  }

  pop() {
    if (this.empty()) {
      throw new Error("Queue is empty");
    }
    return this.stack.pop();
  }

  peek() {
    if (this.empty()) {
      throw new Error("Queue is empty");
    }
    return this.stack[this.stack.length - 1];
  }

  empty() {
    return this.stack.length === 0;
  }
}

/**
 * Priority Queue using Stacks
 * Elements are ordered by priority
 */
class PriorityQueueWithStacks {
  constructor() {
    this.stackIn = [];
    this.stackOut = [];
  }

  push(value, priority) {
    this.stackIn.push({ value, priority });
  }

  pop() {
    this.peek();
    return this.stackOut.pop().value;
  }

  peek() {
    if (this.empty()) {
      throw new Error("Queue is empty");
    }

    if (this.stackOut.length === 0) {
      // Sort by priority while transferring
      const sorted = [];
      while (this.stackIn.length > 0) {
        sorted.push(this.stackIn.pop());
      }

      // Sort by priority (higher priority first)
      sorted.sort((a, b) => b.priority - a.priority);

      // Move to stackOut
      while (sorted.length > 0) {
        this.stackOut.push(sorted.pop());
      }
    }

    return this.stackOut[this.stackOut.length - 1].value;
  }

  empty() {
    return this.stackIn.length === 0 && this.stackOut.length === 0;
  }
}

// Example usage and test cases
console.log("=== Queue Implementation using Stacks ===\n");

// Test Case 1: Basic operations (Optimized version)
console.log("Test Case 1: Basic Queue Operations");
const queue = new MyQueueOptimized();

queue.push(1);
queue.push(2);
queue.push(3);

console.log("Peek:", queue.peek()); // 1
console.log("Pop:", queue.pop()); // 1
console.log("Peek:", queue.peek()); // 2

queue.push(4);
console.log("Pop:", queue.pop()); // 2
console.log("Pop:", queue.pop()); // 3
console.log("Peek:", queue.peek()); // 4
console.log();

// Test Case 2: Demonstrating amortized O(1)
console.log("Test Case 2: Multiple Operations");
const queue2 = new MyQueueOptimized();

console.log("Enqueuing 1-5:");
for (let i = 1; i <= 5; i++) {
  queue2.push(i);
}
queue2.display();

console.log("\nDequeuing 3 elements:");
console.log(queue2.pop()); // 1
console.log(queue2.pop()); // 2
console.log(queue2.pop()); // 3
queue2.display();

console.log("\nEnqueuing 6-7:");
queue2.push(6);
queue2.push(7);
queue2.display();
console.log();

// Test Case 3: Comparison with simple approach
console.log("Test Case 3: Simple Approach (Push O(n))");
const queue3 = new MyQueue();

queue3.push(10);
queue3.push(20);
queue3.push(30);

console.log("Peek:", queue3.peek()); // 10
console.log("Pop:", queue3.pop()); // 10
console.log("Size:", queue3.size()); // 2
console.log();

// Test Case 4: Recursive approach
console.log("Test Case 4: Recursive Approach");
const queue4 = new MyQueueRecursive();

queue4.push(100);
queue4.push(200);
queue4.push(300);

console.log("Peek:", queue4.peek()); // 100
console.log("Pop:", queue4.pop()); // 100
console.log("Pop:", queue4.pop()); // 200
console.log();

// Test Case 5: Priority Queue
console.log("Test Case 5: Priority Queue using Stacks");
const pq = new PriorityQueueWithStacks();

pq.push("Low priority task", 1);
pq.push("High priority task", 10);
pq.push("Medium priority task", 5);
pq.push("Critical task", 20);

console.log("Dequeuing by priority:");
while (!pq.empty()) {
  console.log(pq.pop());
}
console.log();

// Test Case 6: Edge cases
console.log("Test Case 6: Edge Cases");
const emptyQueue = new MyQueueOptimized();
console.log("Is empty?", emptyQueue.empty()); // true

try {
  emptyQueue.pop();
} catch (error) {
  console.log("Error on empty pop:", error.message);
}

try {
  emptyQueue.peek();
} catch (error) {
  console.log("Error on empty peek:", error.message);
}

/*
Python Implementation:

class MyQueue:
    """
    Queue using Two Stacks (Push O(1), Pop O(1) amortized)
    """
    
    def __init__(self):
        self.stack_in = []   # For push
        self.stack_out = []  # For pop
    
    def push(self, x):
        """Push element - O(1)"""
        self.stack_in.append(x)
    
    def pop(self):
        """Pop element - O(1) amortized"""
        self.peek()
        return self.stack_out.pop()
    
    def peek(self):
        """Get front element - O(1) amortized"""
        if self.empty():
            raise Exception("Queue is empty")
        
        # Transfer if needed
        if not self.stack_out:
            while self.stack_in:
                self.stack_out.append(self.stack_in.pop())
        
        return self.stack_out[-1]
    
    def empty(self):
        """Check if empty - O(1)"""
        return not self.stack_in and not self.stack_out
    
    def size(self):
        return len(self.stack_in) + len(self.stack_out)

class MyQueueSimple:
    """
    Queue using Two Stacks (Push O(n), Pop O(1))
    """
    
    def __init__(self):
        self.stack1 = []
        self.stack2 = []
    
    def push(self, x):
        """Push element - O(n)"""
        # Move all to stack2
        while self.stack1:
            self.stack2.append(self.stack1.pop())
        
        # Push new element
        self.stack1.append(x)
        
        # Move all back
        while self.stack2:
            self.stack1.append(self.stack2.pop())
    
    def pop(self):
        """Pop element - O(1)"""
        if self.empty():
            raise Exception("Queue is empty")
        return self.stack1.pop()
    
    def peek(self):
        """Get front - O(1)"""
        if self.empty():
            raise Exception("Queue is empty")
        return self.stack1[-1]
    
    def empty(self):
        return len(self.stack1) == 0

# Example usage
if __name__ == "__main__":
    queue = MyQueue()
    
    queue.push(1)
    queue.push(2)
    queue.push(3)
    
    print("Peek:", queue.peek())  # 1
    print("Pop:", queue.pop())    # 1
    print("Pop:", queue.pop())    # 2
    
    queue.push(4)
    print("Pop:", queue.pop())    # 3
    print("Pop:", queue.pop())    # 4
*/
