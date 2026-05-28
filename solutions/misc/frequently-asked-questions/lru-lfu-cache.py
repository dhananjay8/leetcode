"""
LRU Cache (LC 146) + LFU Cache (LC 460)
Pattern: HashMap + Doubly Linked List

LRU: O(1) get/put — evict Least Recently Used
LFU: O(1) get/put — evict Least Frequently Used (LRU tie-break)
"""

from collections import OrderedDict, defaultdict


# ═══════════════════════════════════════════════════════
# LRU CACHE — using OrderedDict (move_to_end)
# ═══════════════════════════════════════════════════════
class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        # OrderedDict maintains insertion order; move_to_end moves key to end (most recent)
        self.cache: OrderedDict = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        # Move accessed key to end to mark it as most recently used
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            # Update existing key and move to end (most recent)
            self.cache.move_to_end(key)
        self.cache[key] = value
        # If capacity exceeded, evict least recently used (first item in OrderedDict)
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)  # last=False removes from front (LRU)


# ═══════════════════════════════════════════════════════
# LFU CACHE — freq map of OrderedDicts
# ═══════════════════════════════════════════════════════
class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.min_freq = 0  # Track minimum frequency for efficient eviction
        # key_map: key -> [value, frequency]
        self.key_map: dict = {}
        # freq_map: frequency -> OrderedDict of {key: value} (maintains LRU order within same freq)
        self.freq_map: defaultdict = defaultdict(OrderedDict)

    def _update(self, key: int) -> None:
        """Increment frequency of key and update freq_map accordingly."""
        val, freq = self.key_map[key]
        # Remove key from current frequency bucket
        del self.freq_map[freq][key]
        # If bucket becomes empty, delete it and update min_freq if needed
        if not self.freq_map[freq]:
            del self.freq_map[freq]
            if self.min_freq == freq:
                self.min_freq += 1
        # Add key to next frequency bucket (at end = most recently used within this freq)
        self.freq_map[freq + 1][key] = val
        # Update key_map with new frequency
        self.key_map[key] = [val, freq + 1]

    def get(self, key: int) -> int:
        if key not in self.key_map:
            return -1
        # Access increments frequency (LFU) and marks as recent within new freq (LRU tie-break)
        self._update(key)
        return self.key_map[key][0]

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.key_map:
            # Update value and increment frequency
            self.key_map[key][0] = value
            self._update(key)
        else:
            # If at capacity, evict least frequently used (and least recent among ties)
            if len(self.key_map) == self.cap:
                # Evict from min_freq bucket (first item = least recent within that freq)
                evict_key, _ = self.freq_map[self.min_freq].popitem(last=False)
                if not self.freq_map[self.min_freq]:
                    del self.freq_map[self.min_freq]
                del self.key_map[evict_key]
            # Insert new key with frequency 1
            self.key_map[key] = [value, 1]
            self.freq_map[1][key] = value
            self.min_freq = 1  # New key has minimum frequency


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    lru = LRUCache(2)
    lru.put(1, 1); lru.put(2, 2)
    print("LRU get(1):", lru.get(1))   # 1
    lru.put(3, 3)                       # evicts key 2
    print("LRU get(2):", lru.get(2))   # -1

    lfu = LFUCache(2)
    lfu.put(1, 1); lfu.put(2, 2)
    print("LFU get(1):", lfu.get(1))   # 1 (freq[1]=2, freq[2]=1)
    lfu.put(3, 3)                       # evicts key 2
    print("LFU get(2):", lfu.get(2))   # -1
