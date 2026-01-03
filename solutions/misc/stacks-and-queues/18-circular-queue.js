/**
 * 18. Implement a Circular Queue
 *
 * Problem: Design a circular queue (ring buffer) with fixed size.
 * Support enqueue, dequeue, front, rear, isEmpty, and isFull operations.
 *
 * Circular Queue efficiently uses space by reusing freed positions.
 */

/**
 * Approach 1: Using Array with Two Pointers
 * Time Complexity: O(1) for all operations
 * Space Complexity: O(k) where k is the queue capacity
 */
class CircularQueue {
  constructor(k) {
    this.queue = new Array(k);
    this.capacity = k;
    this.front = -1;
    this.rear = -1;
    this.size = 0;
  }

  /**
   * Insert an element into the circular queue
   * Time: O(1)
   */
  enqueue(value) {
    if (this.isFull()) {
      return false;
    }

    // First element
    if (this.isEmpty()) {
      this.front = 0;
      this.rear = 0;
    } else {
      // Move rear circularly
      this.rear = (this.rear + 1) % this.capacity;
    }

    this.queue[this.rear] = value;
    this.size++;
    return true;
  }

  /**
   * Delete an element from the circular queue
   * Time: O(1)
   */
  dequeue() {
    if (this.isEmpty()) {
      return false;
    }

    // Clear the element
    this.queue[this.front] = undefined;

    // Only one element was present
    if (this.front === this.rear) {
      this.front = -1;
      this.rear = -1;
    } else {
      // Move front circularly
      this.front = (this.front + 1) % this.capacity;
    }

    this.size--;
    return true;
  }

  /**
   * Get the front item from the queue
   * Time: O(1)
   */
  Front() {
    if (this.isEmpty()) {
      return -1;
    }
    return this.queue[this.front];
  }

  /**
   * Get the last item from the queue
   * Time: O(1)
   */
  Rear() {
    if (this.isEmpty()) {
      return -1;
    }
    return this.queue[this.rear];
  }

  /**
   * Check if the queue is empty
   * Time: O(1)
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * Check if the queue is full
   * Time: O(1)
   */
  isFull() {
    return this.size === this.capacity;
  }

  /**
   * Get current size
   */
  getSize() {
    return this.size;
  }

  /**
   * Display queue elements
   */
  display() {
    if (this.isEmpty()) {
      console.log("Queue is empty");
      return;
    }

    const elements = [];
    let i = this.front;
    let count = 0;

    while (count < this.size) {
      elements.push(this.queue[i]);
      i = (i + 1) % this.capacity;
      count++;
    }

    console.log("Queue:", elements.join(" <- "));
    console.log(
      `Front: ${this.front}, Rear: ${this.rear}, Size: ${this.size}/${this.capacity}`
    );
  }

  /**
   * Get all elements as array
   */
  toArray() {
    if (this.isEmpty()) {
      return [];
    }

    const result = [];
    let i = this.front;
    let count = 0;

    while (count < this.size) {
      result.push(this.queue[i]);
      i = (i + 1) % this.capacity;
      count++;
    }

    return result;
  }
}

/**
 * Approach 2: Using Count Variable (Alternative)
 * Slightly different implementation using count
 */
class CircularQueueAlt {
  constructor(k) {
    this.buffer = new Array(k);
    this.capacity = k;
    this.head = 0;
    this.count = 0;
  }

  enqueue(value) {
    if (this.isFull()) {
      return false;
    }

    const tail = (this.head + this.count) % this.capacity;
    this.buffer[tail] = value;
    this.count++;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) {
      return false;
    }

    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return true;
  }

  Front() {
    return this.isEmpty() ? -1 : this.buffer[this.head];
  }

  Rear() {
    if (this.isEmpty()) {
      return -1;
    }
    const tail = (this.head + this.count - 1) % this.capacity;
    return this.buffer[tail];
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.capacity;
  }
}

/**
 * Deque (Double-Ended Queue) using Circular Array
 * Supports insertion and deletion from both ends
 */
class CircularDeque {
  constructor(k) {
    this.queue = new Array(k);
    this.capacity = k;
    this.front = 0;
    this.rear = 0;
    this.size = 0;
  }

  insertFront(value) {
    if (this.isFull()) {
      return false;
    }

    if (this.isEmpty()) {
      this.queue[this.front] = value;
    } else {
      this.front = (this.front - 1 + this.capacity) % this.capacity;
      this.queue[this.front] = value;
    }

    this.size++;
    return true;
  }

  insertLast(value) {
    if (this.isFull()) {
      return false;
    }

    if (this.isEmpty()) {
      this.queue[this.rear] = value;
    } else {
      this.rear = (this.rear + 1) % this.capacity;
      this.queue[this.rear] = value;
    }

    this.size++;
    return true;
  }

  deleteFront() {
    if (this.isEmpty()) {
      return false;
    }

    if (this.size === 1) {
      this.front = 0;
      this.rear = 0;
    } else {
      this.front = (this.front + 1) % this.capacity;
    }

    this.size--;
    return true;
  }

  deleteLast() {
    if (this.isEmpty()) {
      return false;
    }

    if (this.size === 1) {
      this.front = 0;
      this.rear = 0;
    } else {
      this.rear = (this.rear - 1 + this.capacity) % this.capacity;
    }

    this.size--;
    return true;
  }

  getFront() {
    return this.isEmpty() ? -1 : this.queue[this.front];
  }

  getRear() {
    return this.isEmpty() ? -1 : this.queue[this.rear];
  }

  isEmpty() {
    return this.size === 0;
  }

  isFull() {
    return this.size === this.capacity;
  }
}

// Example usage and test cases
console.log("=== Circular Queue Implementation ===\n");

// Test Case 1: Basic operations
console.log("Test Case 1: Basic Circular Queue Operations");
const cq = new CircularQueue(5);

console.log("Enqueue 1:", cq.enqueue(1));
console.log("Enqueue 2:", cq.enqueue(2));
console.log("Enqueue 3:", cq.enqueue(3));
cq.display();

console.log("Front:", cq.Front());
console.log("Rear:", cq.Rear());

console.log("Dequeue:", cq.dequeue());
cq.display();

console.log("Enqueue 4:", cq.enqueue(4));
console.log("Enqueue 5:", cq.enqueue(5));
console.log("Enqueue 6:", cq.enqueue(6));
cq.display();
console.log();

// Test Case 2: Full queue
console.log("Test Case 2: Circular Property - Wraparound");
const cq2 = new CircularQueue(3);

cq2.enqueue(1);
cq2.enqueue(2);
cq2.enqueue(3);
console.log("Is Full?", cq2.isFull());

console.log("Try to enqueue 4:", cq2.enqueue(4)); // Should fail
cq2.display();

console.log("Dequeue:", cq2.dequeue());
console.log("Dequeue:", cq2.dequeue());

console.log("Enqueue 4:", cq2.enqueue(4));
console.log("Enqueue 5:", cq2.enqueue(5));
cq2.display();
console.log();

// Test Case 3: Empty queue
console.log("Test Case 3: Empty Queue Operations");
const cq3 = new CircularQueue(3);

console.log("Is Empty?", cq3.isEmpty());
console.log("Front:", cq3.Front());
console.log("Rear:", cq3.Rear());
console.log("Dequeue:", cq3.dequeue());
console.log();

// Test Case 4: Circular Deque
console.log("Test Case 4: Circular Deque (Double-Ended Queue)");
const deque = new CircularDeque(5);

deque.insertLast(1);
deque.insertLast(2);
deque.insertFront(3);
deque.insertFront(4);

console.log("Front:", deque.getFront()); // 4
console.log("Rear:", deque.getRear()); // 2

deque.deleteFront();
console.log("After delete front - Front:", deque.getFront()); // 3

deque.deleteLast();
console.log("After delete last - Rear:", deque.getRear()); // 1

/*
Python Implementation:

class CircularQueue:
    """
    Circular Queue Implementation using Array
    Time Complexity: O(1) for all operations
    Space Complexity: O(k) where k is capacity
    """
    
    def __init__(self, k):
        self.queue = [None] * k
        self.capacity = k
        self.front = -1
        self.rear = -1
        self.size = 0
    
    def enqueue(self, value):
        """Insert element - O(1)"""
        if self.is_full():
            return False
        
        # First element
        if self.is_empty():
            self.front = 0
            self.rear = 0
        else:
            # Move rear circularly
            self.rear = (self.rear + 1) % self.capacity
        
        self.queue[self.rear] = value
        self.size += 1
        return True
    
    def dequeue(self):
        """Delete element - O(1)"""
        if self.is_empty():
            return False
        
        # Clear element
        self.queue[self.front] = None
        
        # Only one element
        if self.front == self.rear:
            self.front = -1
            self.rear = -1
        else:
            # Move front circularly
            self.front = (self.front + 1) % self.capacity
        
        self.size -= 1
        return True
    
    def get_front(self):
        """Get front element - O(1)"""
        if self.is_empty():
            return -1
        return self.queue[self.front]
    
    def get_rear(self):
        """Get rear element - O(1)"""
        if self.is_empty():
            return -1
        return self.queue[self.rear]
    
    def is_empty(self):
        """Check if empty - O(1)"""
        return self.size == 0
    
    def is_full(self):
        """Check if full - O(1)"""
        return self.size == self.capacity
    
    def display(self):
        """Display queue elements"""
        if self.is_empty():
            print("Queue is empty")
            return
        
        elements = []
        i = self.front
        count = 0
        
        while count < self.size:
            elements.append(str(self.queue[i]))
            i = (i + 1) % self.capacity
            count += 1
        
        print("Queue:", " <- ".join(elements))
        print(f"Front: {self.front}, Rear: {self.rear}, Size: {self.size}/{self.capacity}")

# Example usage
if __name__ == "__main__":
    cq = CircularQueue(5)
    
    cq.enqueue(1)
    cq.enqueue(2)
    cq.enqueue(3)
    cq.display()
    
    print("Front:", cq.get_front())  # 1
    print("Rear:", cq.get_rear())    # 3
    
    cq.dequeue()
    cq.enqueue(4)
    cq.display()
*/
