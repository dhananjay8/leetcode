class StackUsingQueues {
  constructor() {
    this.queue1 = [];
    this.queue2 = [];
  }

  // Push an element onto the stack
  push(x) {
    this.queue1.push(x);
  }

  // Pop the top element from the stack
  pop() {
    while (this.queue1.length > 1) {
      this.queue2.push(this.queue1.shift());
    }
    const poppedValue = this.queue1.shift();
    [this.queue1, this.queue2] = [this.queue2, this.queue1];
    return poppedValue;
  }

  // Peek the top element without removing it
  top() {
    while (this.queue1.length > 1) {
      this.queue2.push(this.queue1.shift());
    }
    const topValue = this.queue1[0];
    this.queue2.push(this.queue1.shift());
    [this.queue1, this.queue2] = [this.queue2, this.queue1];
    return topValue;
  }

  // Check if the stack is empty
  isEmpty() {
    return this.queue1.length === 0;
  }
}

// Example usage:
const stack = new StackUsingQueues();
stack.push(1);
stack.push(2);
console.log(stack.top()); // Output: 2
console.log(stack.pop()); // Output: 2
console.log(stack.isEmpty()); // Output: false

// -----------PYTHON-------------------------PYTHON--------------
// from collections import deque

// class StackUsingQueues:
//     def __init__(self):
//         self.queue1 = deque()
//         self.queue2 = deque()

//     def push(self, x):
//         self.queue1.append(x)

//     def pop(self):
//         while len(self.queue1) > 1:
//             self.queue2.append(self.queue1.popleft())
//         popped_value = self.queue1.popleft()
//         self.queue1, self.queue2 = self.queue2, self.queue1
//         return popped_value

//     def top(self):
//         while len(self.queue1) > 1:
//             self.queue2.append(self.queue1.popleft())
//         top_value = self.queue1.popleft()
//         self.queue2.append(top_value)
//         self.queue1, self.queue2 = self.queue2, self.queue1
//         return top_value

//     def is_empty(self):
//         return not self.queue1

// # Example usage:
// stack = StackUsingQueues()
// stack.push(1)
// stack.push(2)
// print(stack.top())  # Output: 2
// print(stack.pop())  # Output: 2
// print(stack.is_empty())  # Output: False

// -----------PYTHON-------------------------PYTHON--------------
// class StackUsingQueues:
//     def __init__(self):
//         self.queue1 = []
//         self.queue2 = []

//     def push(self, x):
//         self.queue1.append(x)

//     def pop(self):
//         while len(self.queue1) > 1:
//             self.queue2.append(self.queue1.pop(0))
//         popped_value = self.queue1.pop(0)
//         self.queue1, self.queue2 = self.queue2, self.queue1
//         return popped_value

//     def top(self):
//         while len(self.queue1) > 1:
//             self.queue2.append(self.queue1.pop(0))
//         top_value = self.queue1[0]
//         self.queue2.append(self.queue1.pop(0))
//         self.queue1, self.queue2 = self.queue2, self.queue1
//         return top_value

//     def is_empty(self):
//         return len(self.queue1) == 0

// # Example usage:
// stack = StackUsingQueues()
// stack.push(1)
// stack.push(2)
// print(stack.top())  # Output: 2
// print(stack.pop())  # Output: 2
// print(stack.is_empty())  # Output: False
