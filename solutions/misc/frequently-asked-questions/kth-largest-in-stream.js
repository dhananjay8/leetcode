/**
 * Kth Largest Element in a Stream (LC 703) — Easy
 * Pattern: Min-Heap of size K
 *
 * Time:  O(log K) per add operation
 * Space: O(K)
 *
 * Key insight: min-heap of size K always holds the K largest elements seen.
 *              heap.peek() = Kth largest.
 */

class MinHeap {
  constructor() { this.h = []; }
  push(v) { this.h.push(v); this._up(this.h.length - 1); }
  pop()   { const t = this.h[0]; const l = this.h.pop(); if (this.h.length) { this.h[0] = l; this._down(0); } return t; }
  peek()  { return this.h[0]; }
  size()  { return this.h.length; }
  _up(i) { while (i > 0) { const p = (i-1)>>1; if (this.h[p] > this.h[i]) { [this.h[p],this.h[i]]=[this.h[i],this.h[p]]; i=p; } else break; } }
  _down(i) { const n=this.h.length; while(true){ let m=i,l=2*i+1,r=2*i+2; if(l<n&&this.h[l]<this.h[m])m=l; if(r<n&&this.h[r]<this.h[m])m=r; if(m===i)break; [this.h[m],this.h[i]]=[this.h[i],this.h[m]]; i=m; } }
}

class KthLargest {
  /**
   * @param {number} k
   * @param {number[]} nums - initial stream values
   */
  constructor(k, nums) {
    this.k = k;
    this.heap = new MinHeap();
    for (const n of nums) this.add(n);
  }

  /**
   * @param {number} val
   * @returns {number} current Kth largest
   */
  add(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop(); // evict smallest
    return this.heap.peek();
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const kl = new KthLargest(3, [4, 5, 8, 2]);
console.log(kl.add(3));  // 4  (stream: [2,3,4,5,8] → 3rd largest=4)
console.log(kl.add(5));  // 5  (stream: [2,3,4,5,5,8] → 3rd largest=5)
console.log(kl.add(10)); // 5
console.log(kl.add(9));  // 8
console.log(kl.add(4));  // 8

module.exports = { KthLargest };
