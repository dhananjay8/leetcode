/**
 * Problem: Daily Temperatures
 * Link: https://leetcode.com/problems/daily-temperatures/
 * Difficulty: Medium
 *
 * Given temperatures array, return array where answer[i] is days until a warmer temperature.
 *
 * Example: temperatures = [73,74,75,71,69,72,76,73] => [1,1,4,2,1,1,0,0]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Monotonic Stack (decreasing)
function dailyTemperatures(temperatures) {
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack = []; // stores indices, monotonically decreasing temps

  for (let i = 0; i < n; i++) {
    // Pop all indices with lower temp than current
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      result[prevIdx] = i - prevIdx; // days waited
    }
    stack.push(i);
  }

  return result; // remaining indices in stack have 0 (no warmer day)
}

module.exports = dailyTemperatures;

/* Python Solution:

def dailyTemperatures(temperatures):
    n = len(temperatures)
    result = [0] * n
    stack = []  # monotonic decreasing stack of indices
    
    for i in range(n):
        while stack and temperatures[i] > temperatures[stack[-1]]:
            prev = stack.pop()
            result[prev] = i - prev
        stack.append(i)
    
    return result

*/
