/**
 * 16. Implement a Stack using an Array
 *
 * Problem: Implement a stack data structure using an array.
 * Support push, pop, peek, isEmpty, and size operations.
 *
 * Stack follows LIFO (Last In First Out) principle
 */

/**
 * Stack Implementation using Array
 * All basic operations: O(1) time complexity
 * Space Complexity: O(n) where n is number of elements
 */
class Stack {
  constructor(capacity = Infinity) {
    this.items = [];
    this.capacity = capacity;
  }

  /**
   * Push an element onto the stack
   * Time Complexity: O(1) amortized
   */
  push(element) {
    if (this.isFull()) {
      throw new Error("Stack Overflow: Stack is full");
    }
    this.items.push(element);
  }

  /**
   * Remove and return the top element
   * Time Complexity: O(1)
   */
  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack Underflow: Cannot pop from empty stack");
    }
    return this.items.pop();
  }

  /**
   * Return the top element without removing it
   * Time Complexity: O(1)
   */
  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items[this.items.length - 1];
  }

  /**
   * Check if stack is empty
   * Time Complexity: O(1)
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Check if stack is full
   * Time Complexity: O(1)
   */
  isFull() {
    return this.items.length >= this.capacity;
  }

  /**
   * Get the size of the stack
   * Time Complexity: O(1)
   */
  size() {
    return this.items.length;
  }

  /**
   * Clear all elements from stack
   * Time Complexity: O(1)
   */
  clear() {
    this.items = [];
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
    console.log("Stack (bottom to top):", this.items.join(" <- "));
  }

  /**
   * Get all elements as array
   * Time Complexity: O(n)
   */
  toArray() {
    return [...this.items];
  }

  /**
   * Search for an element
   * Returns index from top (0 = top), -1 if not found
   * Time Complexity: O(n)
   */
  search(element) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i] === element) {
        return this.items.length - 1 - i;
      }
    }
    return -1;
  }

  /**
   * Get element at specific position from top
   * Time Complexity: O(1)
   */
  getAt(index) {
    if (index < 0 || index >= this.items.length) {
      throw new Error("Index out of bounds");
    }
    return this.items[this.items.length - 1 - index];
  }
}

/**
 * Stack with Fixed Capacity
 * Prevents overflow by limiting size
 */
class FixedStack {
  constructor(capacity) {
    this.items = new Array(capacity);
    this.top = -1;
    this.capacity = capacity;
  }

  push(element) {
    if (this.isFull()) {
      throw new Error("Stack Overflow");
    }
    this.items[++this.top] = element;
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack Underflow");
    }
    const element = this.items[this.top];
    this.items[this.top--] = undefined; // Clear reference
    return element;
  }

  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items[this.top];
  }

  isEmpty() {
    return this.top === -1;
  }

  isFull() {
    return this.top === this.capacity - 1;
  }

  size() {
    return this.top + 1;
  }
}

/**
 * Utility Functions using Stack
 */

// Reverse a string using stack
function reverseString(str) {
  const stack = new Stack();

  // Push all characters
  for (let char of str) {
    stack.push(char);
  }

  // Pop all characters
  let reversed = "";
  while (!stack.isEmpty()) {
    reversed += stack.pop();
  }

  return reversed;
}

// Check balanced parentheses
function isBalanced(expression) {
  const stack = new Stack();
  const pairs = {
    ")": "(",
    "}": "{",
    "]": "[",
  };

  for (let char of expression) {
    if (char === "(" || char === "{" || char === "[") {
      stack.push(char);
    } else if (char === ")" || char === "}" || char === "]") {
      if (stack.isEmpty() || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.isEmpty();
}

// Convert decimal to binary using stack
function decimalToBinary(decimal) {
  const stack = new Stack();

  if (decimal === 0) return "0";

  while (decimal > 0) {
    stack.push(decimal % 2);
    decimal = Math.floor(decimal / 2);
  }

  let binary = "";
  while (!stack.isEmpty()) {
    binary += stack.pop();
  }

  return binary;
}

// Evaluate postfix expression
function evaluatePostfix(expression) {
  const stack = new Stack();
  const tokens = expression.split(" ");

  for (let token of tokens) {
    if (!isNaN(token)) {
      stack.push(Number(token));
    } else {
      const b = stack.pop();
      const a = stack.pop();

      switch (token) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          stack.push(Math.floor(a / b));
          break;
      }
    }
  }

  return stack.pop();
}

// Example usage and test cases
console.log("=== Stack Implementation using Array ===\n");

// Test Case 1: Basic operations
console.log("Test Case 1: Basic Stack Operations");
const stack = new Stack();

stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);
stack.display(); // 10 <- 20 <- 30 <- 40

console.log("Peek:", stack.peek()); // 40
console.log("Size:", stack.size()); // 4

console.log("Popped:", stack.pop()); // 40
console.log("Popped:", stack.pop()); // 30
stack.display(); // 10 <- 20

console.log("Search 20:", stack.search(20)); // 0 (at top)
console.log("Search 10:", stack.search(10)); // 1
console.log();

// Test Case 2: Fixed capacity stack
console.log("Test Case 2: Fixed Capacity Stack");
const fixedStack = new FixedStack(3);

fixedStack.push(1);
fixedStack.push(2);
fixedStack.push(3);

console.log("Is full?", fixedStack.isFull()); // true

try {
  fixedStack.push(4);
} catch (error) {
  console.log("Error:", error.message);
}
console.log();

// Test Case 3: Reverse string
console.log("Test Case 3: Reverse String using Stack");
const str = "Hello, World!";
console.log("Original:", str);
console.log("Reversed:", reverseString(str));
console.log();

// Test Case 4: Balanced parentheses
console.log("Test Case 4: Check Balanced Parentheses");
const expressions = ["((()))", "({[]})", "(()", "{[}]", "(a + b) * (c - d)"];

expressions.forEach((expr) => {
  console.log(`"${expr}" is ${isBalanced(expr) ? "balanced" : "not balanced"}`);
});
console.log();

// Test Case 5: Decimal to Binary
console.log("Test Case 5: Decimal to Binary Conversion");
const decimals = [10, 25, 42, 100];
decimals.forEach((num) => {
  console.log(`${num} in binary: ${decimalToBinary(num)}`);
});
console.log();

// Test Case 6: Evaluate Postfix
console.log("Test Case 6: Evaluate Postfix Expression");
const postfix = "5 3 + 2 *"; // (5 + 3) * 2 = 16
console.log(`Expression: ${postfix}`);
console.log("Result:", evaluatePostfix(postfix));

/*
Python Implementation:

class Stack:
    """
    Stack Implementation using Array (List in Python)
    All basic operations: O(1) time complexity
    Space Complexity: O(n) where n is number of elements
    """
    
    def __init__(self, capacity=float('inf')):
        self.items = []
        self.capacity = capacity
    
    def push(self, element):
        """Push an element onto the stack - O(1) amortized"""
        if self.is_full():
            raise Exception("Stack Overflow: Stack is full")
        self.items.append(element)
    
    def pop(self):
        """Remove and return the top element - O(1)"""
        if self.is_empty():
            raise Exception("Stack Underflow: Cannot pop from empty stack")
        return self.items.pop()
    
    def peek(self):
        """Return the top element without removing it - O(1)"""
        if self.is_empty():
            raise Exception("Stack is empty")
        return self.items[-1]
    
    def is_empty(self):
        """Check if stack is empty - O(1)"""
        return len(self.items) == 0
    
    def is_full(self):
        """Check if stack is full - O(1)"""
        return len(self.items) >= self.capacity
    
    def size(self):
        """Get the size of the stack - O(1)"""
        return len(self.items)
    
    def clear(self):
        """Clear all elements from stack - O(1)"""
        self.items = []
    
    def display(self):
        """Display stack elements - O(n)"""
        if self.is_empty():
            print("Stack is empty")
            return
        print("Stack (bottom to top):", " <- ".join(map(str, self.items)))
    
    def search(self, element):
        """Search for an element - O(n)"""
        try:
            # Return distance from top
            return len(self.items) - 1 - self.items.index(element)
        except ValueError:
            return -1

def reverse_string(s):
    """Reverse a string using stack"""
    stack = Stack()
    
    # Push all characters
    for char in s:
        stack.push(char)
    
    # Pop all characters
    reversed_str = ''
    while not stack.is_empty():
        reversed_str += stack.pop()
    
    return reversed_str

def is_balanced(expression):
    """Check balanced parentheses"""
    stack = Stack()
    pairs = {')': '(', '}': '{', ']': '['}
    
    for char in expression:
        if char in '({[':
            stack.push(char)
        elif char in ')}]':
            if stack.is_empty() or stack.pop() != pairs[char]:
                return False
    
    return stack.is_empty()

def decimal_to_binary(decimal):
    """Convert decimal to binary using stack"""
    stack = Stack()
    
    if decimal == 0:
        return '0'
    
    while decimal > 0:
        stack.push(decimal % 2)
        decimal //= 2
    
    binary = ''
    while not stack.is_empty():
        binary += str(stack.pop())
    
    return binary

# Example usage
if __name__ == "__main__":
    # Basic operations
    stack = Stack()
    stack.push(10)
    stack.push(20)
    stack.push(30)
    stack.display()  # 10 <- 20 <- 30
    
    print("Peek:", stack.peek())  # 30
    print("Popped:", stack.pop())  # 30
    
    # Reverse string
    print("Reversed:", reverse_string("Hello"))  # olleH
    
    # Balanced parentheses
    print("Balanced:", is_balanced("({[]})"))  # True
*/
