/**
 * Problem: Task Scheduler
 * Link: https://leetcode.com/problems/task-scheduler/
 * Difficulty: Medium
 *
 * Given tasks and cooldown n, find minimum intervals to finish all tasks.
 *
 * Example: tasks = ["A","A","A","B","B","B"], n = 2 => 8
 *
 * Time Complexity: O(m) where m is number of tasks
 * Space Complexity: O(1) — at most 26 letters
 */

// JavaScript Solution - Math/Greedy
function leastInterval(tasks, n) {
  const freq = new Array(26).fill(0);
  for (const task of tasks) {
    freq[task.charCodeAt(0) - 65]++;
  }

  const maxFreq = Math.max(...freq);
  // Count how many tasks have the maximum frequency
  const maxCount = freq.filter(f => f === maxFreq).length;

  // Formula: (maxFreq - 1) * (n + 1) + maxCount
  // This accounts for the "frame" created by the most frequent task
  const result = (maxFreq - 1) * (n + 1) + maxCount;

  // Answer is max of formula result and total tasks (no idle needed if enough variety)
  return Math.max(result, tasks.length);
}

module.exports = leastInterval;

/* Python Solution:

from collections import Counter

def leastInterval(tasks, n):
    freq = Counter(tasks)
    max_freq = max(freq.values())
    max_count = sum(1 for v in freq.values() if v == max_freq)
    
    result = (max_freq - 1) * (n + 1) + max_count
    return max(result, len(tasks))

*/
