/**
 * Inserts a new interval into a list of non-overlapping intervals and merges if necessary.
 * @param {number[][]} intervals - List of existing intervals sorted by start time.
 * @param {number[]} newInterval - The new interval to insert.
 * @return {number[][]} - The updated list of merged intervals.
 */
var insert = function (intervals, newInterval) {
  const result = []; // Stores the final merged intervals

  for (let interval of intervals) {
    if (interval[1] < newInterval[0]) {
      // Case 1: Current interval ends before the new interval starts (no overlap)
      result.push(interval);
    } else if (interval[0] > newInterval[1]) {
      // Case 2: Current interval starts after the new interval ends (no overlap)
      result.push(newInterval); // Insert the new interval before continuing
      newInterval = interval; // Update newInterval for further checks
    } else {
      // Case 3: Overlapping intervals, merge them
      newInterval[0] = Math.min(interval[0], newInterval[0]); // Take the min start
      newInterval[1] = Math.max(interval[1], newInterval[1]); // Take the max end
    }
  }

  // Push the last newInterval (merged or unchanged) into result
  result.push(newInterval);

  return result; // Return the final merged intervals
};
