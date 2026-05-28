/**
 * Merge K Sorted Lists (LC 23) — Hard
 * Pattern: Min-Heap (Priority Queue)
 *
 * Time:  O(N log K) — N total nodes, K lists in heap at most
 * Space: O(K) heap + O(N) output
 *
 * 60-Second ID:
 *   Core DS: K linked lists → heap for global minimum
 *   Core Op: merge (find minimum repeatedly)
 *   Constraint: K lists — naive is O(KN), heap reduces to O(N log K)
 *   → Min-Heap seeded with heads of all lists
 */

class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

class MinHeap {
  constructor() { this.h = []; }
  push(node) { this.h.push(node); this._up(this.h.length - 1); }
  pop() { const t = this.h[0]; const l = this.h.pop(); if (this.h.length) { this.h[0] = l; this._down(0); } return t; }
  size() { return this.h.length; }
  _up(i) { while (i > 0) { const p = (i-1)>>1; if (this.h[p].val > this.h[i].val) { [this.h[p],this.h[i]]=[this.h[i],this.h[p]]; i=p; } else break; } }
  _down(i) { const n=this.h.length; while(true){ let m=i,l=2*i+1,r=2*i+2; if(l<n&&this.h[l].val<this.h[m].val)m=l; if(r<n&&this.h[r].val<this.h[m].val)m=r; if(m===i)break; [this.h[m],this.h[i]]=[this.h[i],this.h[m]]; i=m; } }
}

/**
 * @param {ListNode[]} lists
 * @returns {ListNode}
 */
function mergeKLists(lists) {
  const heap = new MinHeap();
  for (const head of lists) {
    if (head) heap.push(head);
  }

  const dummy = new ListNode(0);
  let cur = dummy;

  while (heap.size() > 0) {
    const node = heap.pop();
    cur.next = node;
    cur = cur.next;
    if (node.next) heap.push(node.next);
  }

  return dummy.next;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function arrayToList(arr) {
  let head = null, tail = null;
  for (const v of arr) {
    const n = new ListNode(v);
    if (!head) { head = n; tail = n; }
    else { tail.next = n; tail = n; }
  }
  return head;
}

function listToArray(head) {
  const arr = [];
  while (head) { arr.push(head.val); head = head.next; }
  return arr;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const lists = [
  arrayToList([1, 4, 5]),
  arrayToList([1, 3, 4]),
  arrayToList([2, 6]),
];
console.log(listToArray(mergeKLists(lists))); // [1,1,2,3,4,4,5,6]

module.exports = { mergeKLists, ListNode };
