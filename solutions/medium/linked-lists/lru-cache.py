# class Node {
#     constructor(key, value) {
#         this.key = key;
#         this.value = value;
#         this.prev = null;
#         this.next = null;
#     }
# }

# /**
#  * @param {number} capacity
#  */
# var LRUCache = function(capacity) {
#     this.capacity = capacity;
#     this.cache = new Map();
#     this.head = new Node(0,0);
#     this.tail = new Node(0,0);
#     this.head.next = this.tail;
#     this.tail.prev = this.head;
# };

# LRUCache.prototype._removeFromEnd = function(node) {
#     if (node && node.prev && node.next) {
#         const prevNode = node.prev;
#         const nextNode = node.next;
#         prevNode.next = nextNode;
#         nextNode.prev = prevNode;
#     }
# }

# LRUCache.prototype._addToHead = function(node) {
#     node.next = this.head.next;
#     node.prev = this.head;
#     this.head.next.prev = node;
#     this.head.next = node;
# }

# /** 
#  * @param {number} key
#  * @return {number}
#  */
# LRUCache.prototype.get = function(key) {
#     if(this.cache.has(key)){
#         const node = this.cache.get(key);
#         this._removeFromEnd(node);
#         this._addToHead(node);
#         return node.value;
#     }
#     return -1;
# };

# /** 
#  * @param {number} key 
#  * @param {number} value
#  * @return {void}
#  */
# LRUCache.prototype.put = function(key, value) {
#     if(this.cache.has(key)){
#         const node = this.cache.get(key);
#         node.value = value;
#         this._removeFromEnd(node);
#         this._addToHead(node);
#     } else {
#         if (this.cache.size >= this.capacity) {
#             const tailNode = this.tail.prev;
#             this._removeFromEnd(tailNode);
#             this.cache.delete(tailNode.key);
#         }
#          const newNode = new Node(key, value);
#          this.cache.set(key, newNode);
#          this._addToHead(newNode);
#     };
# };

# /** 
#  * Your LRUCache object will be instantiated and called as such:
#  * var obj = new LRUCache(capacity)
#  * var param_1 = obj.get(key)
#  * obj.put(key,value)
#  */

class Node:
    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None
        
class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node(0, 0)  # dummy head
        self.tail = Node(0, 0)  # dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        prev_node = node.prev
        next_node = node.next
        prev_node.next = next_node
        next_node.prev = prev_node

    def _add_to_head(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add_to_head(node)
            return node.value
        else:
            return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._remove(node)
            self._add_to_head(node)
        else:
            if len(self.cache) >= self.capacity:
                tail_node = self.tail.prev
                self._remove(tail_node)
                del self.cache[tail_node.key]
            new_node = Node(key, value)
            self.cache[key] = new_node
            self._add_to_head(new_node)
        


# Your LRUCache object will be instantiated and called as such:
# obj = LRUCache(capacity)
# param_1 = obj.get(key)
# obj.put(key,value)

