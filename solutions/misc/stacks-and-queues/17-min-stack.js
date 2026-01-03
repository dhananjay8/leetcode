/**
 * 17. Min Stack - Stack with Minimum Element Retrieval
 *
 * Problem: Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) time.
 *
 * Example:
 * minStack.push(-2);
 * minStack.push(0);
 * minStack.push(-3);
 * minStack.getMin(); // Returns -3
 * minStack.pop();
 * minStack.top();    // Returns 0
 * minStack.getMin(); // Returns -2
 */

/**
 * Approach 1: Using Two Stacks
 * Time Complexity: O(1) for all operations
 * Space Complexity: O(n) - auxiliary stack for minimums
 */
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }

  /**
   * Push element onto stack
   * Time: O(1)
   */
  push(val) {
    this.stack.push(val);

    // Push to min stack if it's empty or val is <= current min
    if (this.minStack.length === 0 || val <= this.getMin()) {
      this.minStack.push(val);
    }
  }

  /**
   * Remove top element
   * Time: O(1)
   */
  pop() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }

    const popped = this.stack.pop();

    // If popped element is the minimum, remove it from min stack
    if (popped === this.getMin()) {
      this.minStack.pop();
    }

    return popped;
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
   * Get minimum element
   * Time: O(1)
   */
  getMin() {
    if (this.minStack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.minStack[this.minStack.length - 1];
  }

  isEmpty() {
    return this.stack.length === 0;
  }

  size() {
    return this.stack.length;
  }

  display() {
    console.log("Stack:", this.stack);
    console.log("Min Stack:", this.minStack);
  }
}

/**
 * Approach 2: Using Single Stack with Pairs
 * Store [value, currentMin] pairs
 * Time Complexity: O(1) for all operations
 * Space Complexity: O(n)
 */
class MinStackPairs {
  constructor() {
    this.stack = [];
  }

  push(val) {
    if (this.stack.length === 0) {
      this.stack.push([val, val]);
    } else {
      const currentMin = Math.min(val, this.getMin());
      this.stack.push([val, currentMin]);
    }
  }

  pop() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.stack.pop()[0];
  }

  top() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.stack[this.stack.length - 1][0];
  }

  getMin() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.stack[this.stack.length - 1][1];
  }
}

/**
 * Approach 3: Space-Optimized with Difference Storage
 * Store differences from minimum
 * Time Complexity: O(1) for all operations
 * Space Complexity: O(n) but more space efficient
 */
class MinStackOptimized {
  constructor() {
    this.stack = [];
    this.min = null;
  }

  push(val) {
    if (this.stack.length === 0) {
      this.stack.push(0);
      this.min = val;
    } else {
      // Store difference from current min
      this.stack.push(val - this.min);
      if (val < this.min) {
        this.min = val;
      }
    }
  }

  pop() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }

    const diff = this.stack.pop();

    if (diff < 0) {
      // Current min is being removed
      const val = this.min;
      this.min = this.min - diff; // Restore previous min
      return val;
    } else {
      return this.min + diff;
    }
  }

  top() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }

    const diff = this.stack[this.stack.length - 1];

    if (diff < 0) {
      return this.min;
    } else {
      return this.min + diff;
    }
  }

  getMin() {
    if (this.stack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.min;
  }
}

/**
 * Enhanced MinStack with additional features
 */
class EnhancedMinStack extends MinStack {
  constructor() {
    super();
    this.maxStack = [];
  }

  push(val) {
    super.push(val);

    // Track maximum as well
    if (this.maxStack.length === 0 || val >= this.getMax()) {
      this.maxStack.push(val);
    }
  }

  pop() {
    const popped = super.pop();

    if (popped === this.getMax()) {
      this.maxStack.pop();
    }

    return popped;
  }

  getMax() {
    if (this.maxStack.length === 0) {
      throw new Error("Stack is empty");
    }
    return this.maxStack[this.maxStack.length - 1];
  }

  getRange() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.getMax() - this.getMin();
  }
}

// Example usage and test cases
console.log("=== Min Stack Implementation ===\n");

// Test Case 1: Basic operations
console.log("Test Case 1: Basic MinStack Operations");
const minStack = new MinStack();

minStack.push(-2);
minStack.push(0);
minStack.push(-3);

console.log("Current Min:", minStack.getMin()); // -3
console.log("Top:", minStack.top()); // -3

minStack.pop();
console.log("After pop:");
console.log("Top:", minStack.top()); // 0
console.log("Current Min:", minStack.getMin()); // -2
minStack.display();
console.log();

// Test Case 2: Multiple minimums
console.log("Test Case 2: Multiple Minimum Values");
const minStack2 = new MinStack();

const values = [5, 2, 8, 2, 1, 9, 1];
values.forEach((val) => {
  minStack2.push(val);
  console.log(`Pushed ${val}, Current Min: ${minStack2.getMin()}`);
});

console.log("\nPopping elements:");
while (!minStack2.isEmpty()) {
  console.log(`Top: ${minStack2.top()}, Min: ${minStack2.getMin()}`);
  minStack2.pop();
}
console.log();

// Test Case 3: Using MinStackPairs approach
console.log("Test Case 3: MinStack with Pairs");
const pairStack = new MinStackPairs();

pairStack.push(3);
pairStack.push(5);
pairStack.push(2);
pairStack.push(1);

console.log("Top:", pairStack.top()); // 1
console.log("Min:", pairStack.getMin()); // 1

pairStack.pop();
console.log("After pop - Min:", pairStack.getMin()); // 2
console.log();

// Test Case 4: Enhanced MinStack with Max
console.log("Test Case 4: Enhanced MinStack with Min and Max");
const enhancedStack = new EnhancedMinStack();

[3, 5, 2, 1, 8, 4].forEach((val) => enhancedStack.push(val));

console.log("Min:", enhancedStack.getMin()); // 1
console.log("Max:", enhancedStack.getMax()); // 8
console.log("Range:", enhancedStack.getRange()); // 7
console.log();

// Test Case 5: Edge cases
console.log("Test Case 5: Edge Cases");
const edgeStack = new MinStack();

// Single element
edgeStack.push(1);
console.log("Single element - Min:", edgeStack.getMin()); // 1

// All same elements
const sameStack = new MinStack();
[5, 5, 5, 5].forEach((val) => sameStack.push(val));
console.log("All same - Min:", sameStack.getMin()); // 5

// Decreasing sequence
const decStack = new MinStack();
[10, 8, 6, 4, 2].forEach((val) => decStack.push(val));
console.log("Decreasing - Min:", decStack.getMin()); // 2

/*
Python Implementation:

class MinStack:
    """
    Approach 1: Using Two Stacks
    Time Complexity: O(1) for all operations
    Space Complexity: O(n)
    """
    
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        """Push element onto stack - O(1)"""
        self.stack.append(val)
        
        # Push to min stack if empty or val is <= current min
        if not self.min_stack or val <= self.get_min():
            self.min_stack.append(val)
    
    def pop(self):
        """Remove top element - O(1)"""
        if not self.stack:
            raise Exception("Stack is empty")
        
        popped = self.stack.pop()
        
        # If popped is the minimum, remove from min stack
        if popped == self.get_min():
            self.min_stack.pop()
        
        return popped
    
    def top(self):
        """Get top element - O(1)"""
        if not self.stack:
            raise Exception("Stack is empty")
        return self.stack[-1]
    
    def get_min(self):
        """Get minimum element - O(1)"""
        if not self.min_stack:
            raise Exception("Stack is empty")
        return self.min_stack[-1]
    
    def is_empty(self):
        return len(self.stack) == 0
    
    def display(self):
        print('Stack:', self.stack)
        print('Min Stack:', self.min_stack)

class MinStackPairs:
    """
    Approach 2: Using Single Stack with Pairs
    Time Complexity: O(1) for all operations
    Space Complexity: O(n)
    """
    
    def __init__(self):
        self.stack = []
    
    def push(self, val):
        if not self.stack:
            self.stack.append((val, val))
        else:
            current_min = min(val, self.get_min())
            self.stack.append((val, current_min))
    
    def pop(self):
        if not self.stack:
            raise Exception("Stack is empty")
        return self.stack.pop()[0]
    
    def top(self):
        if not self.stack:
            raise Exception("Stack is empty")
        return self.stack[-1][0]
    
    def get_min(self):
        if not self.stack:
            raise Exception("Stack is empty")
        return self.stack[-1][1]

# Example usage
if __name__ == "__main__":
    # Test MinStack
    min_stack = MinStack()
    
    min_stack.push(-2)
    min_stack.push(0)
    min_stack.push(-3)
    
    print("Min:", min_stack.get_min())  # -3
    min_stack.pop()
    print("Top:", min_stack.top())  # 0
    print("Min:", min_stack.get_min())  # -2
*/
