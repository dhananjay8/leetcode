/**
 * Find Median from Data Stream (LC 295) — Hard
 * Pattern: Two Heaps (max-heap + min-heap)
 *
 * Insight: Keep lower half in maxHeap, upper half in minHeap.
 *   median = top of maxHeap (odd total) or avg of both tops (even total)
 *
 * Time: O(log n) addNum, O(1) findMedian
 * Space: O(n)
 */

class MaxHeap {
  constructor() { this.h = []; }
  push(v) { this.h.push(v); this._up(this.h.length - 1); }
  pop()   { const t = this.h[0]; const l = this.h.pop(); if (this.h.length) { this.h[0] = l; this._down(0); } return t; }
  peek()  { return this.h[0]; }
  size()  { return this.h.length; }
  _up(i) { while (i > 0) { const p = (i-1)>>1; if (this.h[p] < this.h[i]) { [this.h[p],this.h[i]]=[this.h[i],this.h[p]]; i=p; } else break; } }
  _down(i) { const n=this.h.length; while(true){ let m=i,l=2*i+1,r=2*i+2; if(l<n&&this.h[l]>this.h[m])m=l; if(r<n&&this.h[r]>this.h[m])m=r; if(m===i)break; [this.h[m],this.h[i]]=[this.h[i],this.h[m]]; i=m; } }
}

class MinHeap {
  constructor() { this.h = []; }
  push(v) { this.h.push(v); this._up(this.h.length - 1); }
  pop()   { const t = this.h[0]; const l = this.h.pop(); if (this.h.length) { this.h[0] = l; this._down(0); } return t; }
  peek()  { return this.h[0]; }
  size()  { return this.h.length; }
  _up(i) { while (i > 0) { const p = (i-1)>>1; if (this.h[p] > this.h[i]) { [this.h[p],this.h[i]]=[this.h[i],this.h[p]]; i=p; } else break; } }
  _down(i) { const n=this.h.length; while(true){ let m=i,l=2*i+1,r=2*i+2; if(l<n&&this.h[l]<this.h[m])m=l; if(r<n&&this.h[r]<this.h[m])m=r; if(m===i)break; [this.h[m],this.h[i]]=[this.h[i],this.h[m]]; i=m; } }
}

class MedianFinder {
  constructor() {
    this.lo = new MaxHeap(); // lower half
    this.hi = new MinHeap(); // upper half
  }

  addNum(num) {
    // Always push to lo first, then rebalance
    this.lo.push(num);
    this.hi.push(this.lo.pop()); // largest of lo goes to hi

    // Keep lo.size >= hi.size (lo can have one extra)
    if (this.hi.size() > this.lo.size()) {
      this.lo.push(this.hi.pop());
    }
  }

  findMedian() {
    if (this.lo.size() > this.hi.size()) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const mf = new MedianFinder();
mf.addNum(1); mf.addNum(2);
console.log(mf.findMedian()); // 1.5
mf.addNum(3);
console.log(mf.findMedian()); // 2.0

module.exports = { MedianFinder };
