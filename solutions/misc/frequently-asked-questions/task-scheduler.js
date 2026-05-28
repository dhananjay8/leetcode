/**
 * Task Scheduler (LC 621) — Medium
 * Pattern: Greedy + Max-Heap + Cooldown Queue
 *
 * Time:  O(N log 26) = O(N) since at most 26 task types
 * Space: O(26) = O(1)
 *
 * 60-Second ID:
 *   Core DS: task frequencies → max-heap; cooldown → queue
 *   Core Op: minimize total time (optimize scheduling)
 *   Constraint: same task must be n intervals apart
 *   → Greedy: always execute most frequent available task
 *
 * Alternate O(1) formula: max(N, (maxFreq-1)*(n+1) + countOfMaxFreq)
 */

/**
 * Simulation with Max-Heap + cooldown queue
 * @param {string[]} tasks
 * @param {number} n - cooldown
 * @returns {number} minimum intervals
 */
function leastInterval(tasks, n) {
  const freq = new Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0) - 65]++;

  // Max-heap (negate for min-heap simulation)
  // Using sorted array as priority queue (26 elements max — acceptable)
  let maxHeap = freq.filter(f => f > 0).sort((a, b) => b - a);

  let time = 0;
  const queue = []; // [remaining_count, available_at_time]

  while (maxHeap.length > 0 || queue.length > 0) {
    time++;

    if (maxHeap.length > 0) {
      const top = maxHeap.shift() - 1; // execute most frequent
      if (top > 0) queue.push([top, time + n]); // requeue after cooldown
    }
    // idle cycle otherwise (time still increments)

    // Release tasks whose cooldown has expired
    if (queue.length > 0 && queue[0][1] === time) {
      const [cnt] = queue.shift();
      maxHeap.push(cnt);
      maxHeap.sort((a, b) => b - a); // keep sorted
    }
  }

  return time;
}

/**
 * O(1) formula approach
 * @param {string[]} tasks
 * @param {number} n
 * @returns {number}
 */
function leastIntervalFormula(tasks, n) {
  const freq = new Array(26).fill(0);
  for (const t of tasks) freq[t.charCodeAt(0) - 65]++;

  const maxFreq = Math.max(...freq);
  const countOfMax = freq.filter(f => f === maxFreq).length;

  return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + countOfMax);
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(leastInterval(["A","A","A","B","B","B"], 2));        // 8
console.log(leastInterval(["A","A","A","B","B","B"], 0));        // 6
console.log(leastInterval(["A","A","A","A","A","A","B","C","D","E","F","G"], 2)); // 16

console.log(leastIntervalFormula(["A","A","A","B","B","B"], 2)); // 8

module.exports = { leastInterval, leastIntervalFormula };
