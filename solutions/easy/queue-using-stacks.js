class QueueUsingStacks {
  constructor() {
    this.stack1 = [];
    this.stack2 = [];
  }

  // Enqueue an element into the queue
  enqueue(x) {
    this.stack1.push(x);
  }

  // Dequeue an element from the queue
  dequeue() {
    if (this.stack2.length === 0) {
      while (this.stack1.length > 0) {
        this.stack2.push(this.stack1.pop());
      }
    }
    return this.stack2.pop();
  }

  // Peek the front element without removing it
  front() {
    if (this.stack2.length === 0) {
      while (this.stack1.length > 0) {
        this.stack2.push(this.stack1.pop());
      }
    }
    return this.stack2[this.stack2.length - 1];
  }

  // Check if the queue is empty
  isEmpty() {
    return this.stack1.length === 0 && this.stack2.length === 0;
  }
}

// Example usage:
const queue = new QueueUsingStacks();
queue.enqueue(1);
queue.enqueue(2);
console.log(queue.front()); // Output: 1
console.log(queue.dequeue()); // Output: 1
console.log(queue.isEmpty()); // Output: false

// -----------PYTHON-------------------------PYTHON--------------
// class QueueUsingStacks:
//     def __init__(self):
//         self.stack1 = []
//         self.stack2 = []

//     def enqueue(self, x):
//         self.stack1.append(x)

//     def dequeue(self):
//         if not self.stack2:
//             while self.stack1:
//                 self.stack2.append(self.stack1.pop())
//         return self.stack2.pop()

//     def front(self):
//         if not self.stack2:
//             while self.stack1:
//                 self.stack2.append(self.stack1.pop())
//         return self.stack2[-1]

//     def is_empty(self):
//         return not self.stack1 and not self.stack2

// # Example usage:
// queue = QueueUsingStacks()
// queue.enqueue(1)
// queue.enqueue(2)
// print(queue.front())  # Output: 1
// print(queue.dequeue())  # Output: 1
// print(queue.is_empty())  # Output: False

// -----------PYTHON-------------------------PYTHON--------------
// class QueueUsingStacks:
//     def __init__(self):
//         self.stack1 = []
//         self.stack2 = []

//     def enqueue(self, x):
//         self.stack1.append(x)

//     def dequeue(self):
//         if not self.stack2:
//             while self.stack1:
//                 self.stack2.append(self.stack1.pop())
//         return self.stack2.pop()

//     def front(self):
//         if not self.stack2:
//             while self.stack1:
//                 self.stack2.append(self.stack1.pop())
//         return self.stack2[-1]

//     def is_empty(self):
//         return len(self.stack1) == 0 and len(self.stack2) == 0

// # Example usage:
// queue = QueueUsingStacks()
// queue.enqueue(1)
// queue.enqueue(2)
// print(queue.front())  # Output: 1
// print(queue.dequeue())  # Output: 1
// print(queue.is_empty())  # Output: False
