/**
 * LRU Cache (LC 146) + LFU Cache (LC 460)
 * Pattern: HashMap + Doubly Linked List
 *
 * LRU: O(1) get/put — evict Least Recently Used
 * LFU: O(1) get/put — evict Least Frequently Used (tie-break: LRU among same freq)
 */

// ═══════════════════════════════════════════════════════
// LRU CACHE
// ═══════════════════════════════════════════════════════
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map(); // key → node
    // Sentinel head (oldest) and tail (newest)
    this.head = { key: 0, val: 0, prev: null, next: null };
    this.tail = { key: 0, val: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insertAtTail(node) {
    node.prev = this.tail.prev;
    node.next = this.tail;
    this.tail.prev.next = node;
    this.tail.prev = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._insertAtTail(node);
    return node.val;
  }

  put(key, val) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    } else if (this.map.size === this.cap) {
      const lru = this.head.next; // evict oldest
      this._remove(lru);
      this.map.delete(lru.key);
    }
    const node = { key, val, prev: null, next: null };
    this._insertAtTail(node);
    this.map.set(key, node);
  }
}

// ═══════════════════════════════════════════════════════
// LFU CACHE
// ═══════════════════════════════════════════════════════
class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.minFreq = 0;
    this.keyMap  = new Map(); // key → {val, freq}
    this.freqMap = new Map(); // freq → LinkedHashSet (ordered by insertion = LRU order)
  }

  _getList(freq) {
    if (!this.freqMap.has(freq)) this.freqMap.set(freq, new Map());
    return this.freqMap.get(freq);
  }

  _increment(key) {
    const { val, freq } = this.keyMap.get(key);
    const oldList = this.freqMap.get(freq);
    oldList.delete(key);
    if (oldList.size === 0) {
      this.freqMap.delete(freq);
      if (this.minFreq === freq) this.minFreq++;
    }
    const newFreq = freq + 1;
    this.keyMap.set(key, { val, freq: newFreq });
    this._getList(newFreq).set(key, true);
  }

  get(key) {
    if (!this.keyMap.has(key)) return -1;
    this._increment(key);
    return this.keyMap.get(key).val;
  }

  put(key, val) {
    if (this.cap === 0) return;
    if (this.keyMap.has(key)) {
      this.keyMap.get(key).val = val;
      this._increment(key);
      return;
    }
    if (this.keyMap.size === this.cap) {
      const minList = this.freqMap.get(this.minFreq);
      const evictKey = minList.keys().next().value; // first = LRU among min-freq
      minList.delete(evictKey);
      if (minList.size === 0) this.freqMap.delete(this.minFreq);
      this.keyMap.delete(evictKey);
    }
    this.keyMap.set(key, { val, freq: 1 });
    this._getList(1).set(key, true);
    this.minFreq = 1;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const lru = new LRUCache(2);
lru.put(1, 1); lru.put(2, 2);
console.log("LRU get(1):", lru.get(1)); // 1
lru.put(3, 3); // evicts key 2
console.log("LRU get(2):", lru.get(2)); // -1

const lfu = new LFUCache(2);
lfu.put(1, 1); lfu.put(2, 2);
console.log("LFU get(1):", lfu.get(1)); // 1 (freq[1]=2, freq[2]=1)
lfu.put(3, 3); // evicts key 2 (least frequent)
console.log("LFU get(2):", lfu.get(2)); // -1

module.exports = { LRUCache, LFUCache };
