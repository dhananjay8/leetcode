/**
 * Problem: Maximum Frequency Stack
 * Link: https://leetcode.com/problems/maximum-frequency-stack/
 * Difficulty: Hard
 *
 * push(val): Push value onto stack.
 * pop(): Remove and return the most frequent element (tie: most recently pushed).
 *
 * Time Complexity: O(1) per operation
 * Space Complexity: O(n)
 */

// JavaScript Solution
class FreqStack {
  constructor() {
    this.freq = new Map();      // val -> frequency
    this.group = new Map();     // frequency -> stack of values
    this.maxFreq = 0;
  }

  push(val) {
    const f = (this.freq.get(val) || 0) + 1;
    this.freq.set(val, f);
    this.maxFreq = Math.max(this.maxFreq, f);

    if (!this.group.has(f)) this.group.set(f, []);
    this.group.get(f).push(val); // add to frequency group
  }

  pop() {
    // Pop from the highest frequency group
    const stack = this.group.get(this.maxFreq);
    const val = stack.pop();

    this.freq.set(val, this.freq.get(val) - 1);

    // If no more elements at maxFreq, decrease it
    if (stack.length === 0) this.maxFreq--;

    return val;
  }
}

module.exports = FreqStack;

/* Python Solution:

from collections import defaultdict

class FreqStack:
    def __init__(self):
        self.freq = defaultdict(int)      # val -> freq
        self.group = defaultdict(list)    # freq -> stack of vals
        self.max_freq = 0
    
    def push(self, val):
        self.freq[val] += 1
        f = self.freq[val]
        self.max_freq = max(self.max_freq, f)
        self.group[f].append(val)
    
    def pop(self):
        val = self.group[self.max_freq].pop()
        self.freq[val] -= 1
        if not self.group[self.max_freq]:
            self.max_freq -= 1
        return val

*/
