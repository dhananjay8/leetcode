/**
 * @param {number[]} nums
 * @return {number}
 */
var findDuplicate = function (nums) {
  for (let i = 0; i < nums.length; i++) {
    let index = Math.abs(nums[i]);
    if (nums[index] < 0) return index; // Found the duplicate
    nums[index] = -nums[index]; // Mark visited
  }
  return -1;
};

var findDuplicate = function (nums) {
  let slow = nums[0];
  let fast = nums[0];

  // Step 1: Detect cycle using Floyd's Algorithm
  while (true) {
    slow = nums[slow]; // Move slow pointer by 1 step
    fast = nums[nums[fast]]; // Move fast pointer by 2 steps

    if (slow === fast) break; // Break when cycle is detected
  }

  // Step 2: Find the entry point of the cycle (duplicate number)
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }

  return slow; // The duplicate number
};
