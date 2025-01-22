/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function (intervals) {
  if (intervals.length === 0) return [];

  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);

  let stack = [];

  // Push the first interval onto the stack
  stack.push(intervals[0]);

  for (let i = 1; i < intervals.length; i++) {
    let top = stack[stack.length - 1]; // Get the top of the stack

    // If the current interval overlaps with the top of the stack, merge them
    if (top[1] >= intervals[i][0]) {
      top[1] = Math.max(top[1], intervals[i][1]);
    } else {
      // Otherwise, push the current interval onto the stack
      stack.push(intervals[i]);
    }
  }

  return stack;
};

var merge = function (intervals) {
  if (intervals.length === 0) return [];

  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);

  let result = [];
  let current = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    // If intervals overlap, merge them
    if (current[1] >= intervals[i][0]) {
      current[1] = Math.max(current[1], intervals[i][1]);
    } else {
      // Push the current interval and move to the next
      result.push(current);
      current = intervals[i];
    }
  }

  // Push the last interval
  result.push(current);
  return result;
};
