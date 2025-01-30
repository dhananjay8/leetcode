// USING Array
/**
 * @param {number[]} nums
 * @return {string[]}
 */
var summaryRanges = function (nums) {
  if (nums.length === 0) return [];
  const summaryRanges = [];

  let start = nums[0]; // Keeps track of the beginning of a range.

  for (let i = 0; i < nums.length; i++) {
    const currentNumber = nums[i],
      nextNumber = nums[i + 1];
    if (currentNumber + 1 !== nextNumber) {
      // we have reached the end of a continuous sequence.

      // If start equals currentNumber, it’s a single number.
      summaryRanges.push(
        start === currentNumber ? `${start}` : `${start}->${currentNumber}`
      );

      start = nextNumber;
    }
  }

  console.log(summaryRanges);

  return summaryRanges;
};

// USING HASHMAP
/**
 * @param {number[]} nums
 * @return {string[]}
 */
var summaryRanges = function (nums) {
  if (nums.length === 0) return [];

  const ranges = new Map();
  let start = nums[0];
  let end = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const next = end + 1;
    const curr = nums[i];
    console.log(start, end, curr, next, ranges);
    // if next number is as expected (curr + 1), incr end ptr
    if (curr === next) {
      end = curr;
    } else {
      if (start === end) {
        ranges.set(start.toString(), null);
      } else {
        ranges.set(start.toString(), end.toString());
      }
      // set both pointers to curr as range has ended & we need to find next interval
      start = end = curr;
    }
  }
  // to handle last range interval
  if (start === end) {
    ranges.set(start.toString(), null);
  } else {
    ranges.set(start.toString(), end.toString());
  }
  console.log(start, end, ranges);
  const results = [];
  for (const [start, end] of ranges) {
    if (end === null) {
      results.push(start);
    } else {
      results.push(start + "->" + end);
    }
  }
  return results;
};
