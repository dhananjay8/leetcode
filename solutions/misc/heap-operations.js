class Heap {
  constructor(compare = (a, b) => a < b) {
    this.data = []; // Array to store heap elements
    this.compare = compare; // Comparison function (default is a min-heap)
  }

  // Get the parent index
  parentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  // Get the left child index
  leftChildIndex(index) {
    return 2 * index + 1;
  }

  // Get the right child index
  rightChildIndex(index) {
    return 2 * index + 2;
  }

  // Insert an element into the heap
  insert(val) {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  // Remove and return the top element of the heap
  extractTop() {
    if (this.data.length === 0) return null;
    if (this.data.length === 1) return this.data.pop();

    const top = this.data[0];
    this.data[0] = this.data.pop(); // Move the last element to the top
    this.bubbleDown(0); // Reorganize the heap
    return top;
  }

  // Peek at the top element of the heap without removing it
  peek() {
    return this.data.length > 0 ? this.data[0] : null;
  }

  // Bubble up the element at the given index
  bubbleUp(index) {
    while (
      index > 0 &&
      this.compare(this.data[index], this.data[this.parentIndex(index)])
    ) {
      this.swap(index, this.parentIndex(index));
      index = this.parentIndex(index);
    }
  }

  // Bubble down the element at the given index
  bubbleDown(index) {
    const size = this.data.length;
    while (true) {
      const left = this.leftChildIndex(index);
      const right = this.rightChildIndex(index);
      let smallest = index;

      if (left < size && this.compare(this.data[left], this.data[smallest])) {
        smallest = left;
      }

      if (right < size && this.compare(this.data[right], this.data[smallest])) {
        smallest = right;
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  // Swap two elements in the heap
  swap(i, j) {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }
}

// Min-Heap (Default)
const minHeap = new Heap();
minHeap.insert(3);
minHeap.insert(1);
minHeap.insert(5);
console.log(minHeap.peek()); // Output: 1
console.log(minHeap.extractTop()); // Output: 1
console.log(minHeap.extractTop()); // Output: 3
console.log(minHeap.extractTop()); // Output: 5

// Max-Heap
const maxHeap = new Heap((a, b) => a > b); // Max-heap
maxHeap.insert(3);
maxHeap.insert(1);
maxHeap.insert(5);
console.log(maxHeap.peek()); // Output: 5
console.log(maxHeap.extractTop()); // Output: 5
console.log(maxHeap.extractTop()); // Output: 3
console.log(maxHeap.extractTop()); // Output: 1

// -----------PYTHON-------------------------PYTHON--------------
// import heapq

// class Heap:
//     def __init__(self, is_min_heap=True):
//         self.data = []
//         self.is_min_heap = is_min_heap

//     def push(self, val):
//         if not self.is_min_heap:
//             val = -val
//         heapq.heappush(self.data, val)

//     def pop(self):
//         val = heapq.heappop(self.data)
//         return val if self.is_min_heap else -val

//     def peek(self):
//         val = self.data[0]
//         return val if self.is_min_heap else -val

// # Example usage:
// min_heap = Heap()  # Min-heap
// min_heap.push(3)
// min_heap.push(1)
// min_heap.push(5)
// print(min_heap.pop())  # Output: 1

// max_heap = Heap(is_min_heap=False)  # Max-heap
// max_heap.push(3)
// max_heap.push(1)
// max_heap.push(5)
// print(max_heap.pop())  # Output: 5

// -----------PYTHON-------------------------PYTHON--------------

// class Heap:
//     def __init__(self, is_min_heap=True):
//         self.data = []
//         self.is_min_heap = is_min_heap

//     def compare(self, a, b):
//         return a < b if self.is_min_heap else a > b

//     def push(self, val):
//         self.data.append(val)
//         self._bubble_up(len(self.data) - 1)

//     def pop(self):
//         if len(self.data) == 0:
//             return None
//         if len(self.data) == 1:
//             return self.data.pop()
//         top = self.data[0]
//         self.data[0] = self.data.pop()
//         self._bubble_down(0)
//         return top

//     def peek(self):
//         return self.data[0] if self.data else None

//     def _bubble_up(self, index):
//         while index > 0:
//             parent = (index - 1) // 2
//             if self.compare(self.data[index], self.data[parent]):
//                 self.data[index], self.data[parent] = self.data[parent], self.data[index]
//                 index = parent
//             else:
//                 break

//     def _bubble_down(self, index):
//         n = len(self.data)
//         while True:
//             left = 2 * index + 1
//             right = 2 * index + 2
//             smallest = index

//             if left < n and self.compare(self.data[left], self.data[smallest]):
//                 smallest = left
//             if right < n and self.compare(self.data[right], self.data[smallest]):
//                 smallest = right

//             if smallest == index:
//                 break

//             self.data[index], self.data[smallest] = self.data[smallest], self.data[index]
//             index = smallest

// # Example usage:
// min_heap = Heap()  # Min-heap
// min_heap.push(3)
// min_heap.push(1)
// min_heap.push(5)
// print(min_heap.pop())  # Output: 1

// max_heap = Heap(is_min_heap=False)  # Max-heap
// max_heap.push(3)
// max_heap.push(1)
// max_heap.push(5)
// print(max_heap.pop())  # Output: 5
