/**
 * Problem 1 (DE Round - Easy, ~8 min)
 * "Given a stream of events, find the top-K most active users in the last 1 hour."
 *
 * Pattern: Heap + Sliding Window
 * Time:  O(n log K) per query
 * Space: O(n) for the window
 *
 * 60-Second Identification:
 *   Core DS: stream → array/queue; ranking → heap
 *   Core Op: find top-K (optimize/rank)
 *   Constraint: real-time stream, 1-hour window (time-based sliding)
 *   → Sliding Window (time-based) + Min-Heap of size K
 */

class MinHeap {
  constructor() { this.heap = []; }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  peek() { return this.heap[0]; }
  size() { return this.heap.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent][1] > this.heap[i][1]) {
        [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
        i = parent;
      } else break;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l][1] < this.heap[smallest][1]) smallest = l;
      if (r < n && this.heap[r][1] < this.heap[smallest][1]) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

/**
 * @param {Array<{userId: string, timestamp: number}>} events - stream of events
 * @param {number} k - number of top users to return
 * @param {number} windowMs - sliding window in ms (default 3600000 = 1 hour)
 * @returns {Array<{userId: string, count: number}>} top-K users sorted by activity desc
 */
function topKActiveUsers(events, k, windowMs = 3_600_000) {
  // Sort events by timestamp (in real stream they'd already be ordered)
  events.sort((a, b) => a.timestamp - b.timestamp);

  const windowQueue = [];     // deque of events in current window
  const freq = new Map();     // userId -> count within window

  let left = 0;

  // Process all events; at each step maintain window ending at events[right]
  for (let right = 0; right < events.length; right++) {
    const { userId, timestamp } = events[right];

    // Add to window
    freq.set(userId, (freq.get(userId) || 0) + 1);
    windowQueue.push(events[right]);

    // Evict events older than windowMs from left
    while (windowQueue.length > 0 && timestamp - windowQueue[0].timestamp > windowMs) {
      const evicted = windowQueue.shift();
      const newCount = freq.get(evicted.userId) - 1;
      if (newCount === 0) freq.delete(evicted.userId);
      else freq.set(evicted.userId, newCount);
      left++;
    }
  }

  // At this point freq holds all users active in the last windowMs from the last event
  // Use min-heap of size K to get top-K
  const heap = new MinHeap();
  for (const [userId, count] of freq) {
    heap.push([userId, count]);
    if (heap.size() > k) heap.pop(); // evict smallest
  }

  // Collect and sort descending
  const result = [];
  while (heap.size() > 0) result.push(heap.pop());
  return result.map(([userId, count]) => ({ userId, count })).sort((a, b) => b.count - a.count);
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const now = Date.now();
const events = [
  { userId: "alice",   timestamp: now - 3500000 },
  { userId: "bob",     timestamp: now - 3000000 },
  { userId: "alice",   timestamp: now - 2000000 },
  { userId: "charlie", timestamp: now - 1500000 },
  { userId: "alice",   timestamp: now - 500000  },
  { userId: "bob",     timestamp: now - 400000  },
  { userId: "bob",     timestamp: now - 100000  },
  { userId: "dave",    timestamp: now - 50000   },
];

console.log("Top 2 active users:", topKActiveUsers(events, 2));
// Expected: bob(3), alice(2) or alice(3) depending on window boundary

module.exports = { topKActiveUsers };
