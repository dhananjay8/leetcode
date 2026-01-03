/**
 * Problem: Insert Delete GetRandom O(1)
 * Link: https://leetcode.com/problems/insert-delete-getrandom-o1/
 * Difficulty: Medium
 *
 * Implement RandomizedSet class with insert, remove, and getRandom in O(1) average time.
 *
 * Example:
 * randomizedSet.insert(1); // true
 * randomizedSet.remove(2); // false
 * randomizedSet.insert(2); // true
 * randomizedSet.getRandom(); // 1 or 2
 *
 * Time Complexity: O(1) for all operations
 * Space Complexity: O(n)
 */

// JavaScript Solution - HashMap + Array
class RandomizedSet {
  constructor() {
    this.map = new Map(); // value -> index in array
    this.list = []; // stores values
  }

  insert(val) {
    if (this.map.has(val)) {
      return false;
    }

    this.map.set(val, this.list.length);
    this.list.push(val);
    return true;
  }

  remove(val) {
    if (!this.map.has(val)) {
      return false;
    }

    // Get index of value to remove
    const index = this.map.get(val);
    const lastElement = this.list[this.list.length - 1];

    // Swap with last element
    this.list[index] = lastElement;
    this.map.set(lastElement, index);

    // Remove last element
    this.list.pop();
    this.map.delete(val);

    return true;
  }

  getRandom() {
    const randomIndex = Math.floor(Math.random() * this.list.length);
    return this.list[randomIndex];
  }
}

// Test cases
const randomizedSet = new RandomizedSet();
console.log(randomizedSet.insert(1)); // true
console.log(randomizedSet.remove(2)); // false
console.log(randomizedSet.insert(2)); // true
console.log(randomizedSet.getRandom()); // 1 or 2
console.log(randomizedSet.remove(1)); // true
console.log(randomizedSet.insert(2)); // false
console.log(randomizedSet.getRandom()); // 2

module.exports = RandomizedSet;

/* Python Solution (commented):

import random

class RandomizedSet:
    """
    RandomizedSet with O(1) operations
    
    Time Complexity: O(1) for all operations
    Space Complexity: O(n)
    """
    
    def __init__(self):
        self.map = {}  # value -> index
        self.list = []  # stores values
    
    def insert(self, val: int) -> bool:
        if val in self.map:
            return False
        
        self.map[val] = len(self.list)
        self.list.append(val)
        return True
    
    def remove(self, val: int) -> bool:
        if val not in self.map:
            return False
        
        # Get index of value
        index = self.map[val]
        last_element = self.list[-1]
        
        # Swap with last element
        self.list[index] = last_element
        self.map[last_element] = index
        
        # Remove last
        self.list.pop()
        del self.map[val]
        
        return True
    
    def get_random(self) -> int:
        return random.choice(self.list)

# Test cases
randomized_set = RandomizedSet()
print(randomized_set.insert(1))  # True
print(randomized_set.remove(2))  # False
print(randomized_set.insert(2))  # True
print(randomized_set.get_random())  # 1 or 2
print(randomized_set.remove(1))  # True
print(randomized_set.insert(2))  # False
print(randomized_set.get_random())  # 2

*/
