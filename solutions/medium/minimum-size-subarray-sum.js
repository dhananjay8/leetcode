/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function (target, nums) {
  let leftPointer = 0;
  let res = Infinity;
  let currSum = 0;
  for (let rightPointer = 0; rightPointer < nums.length; rightPointer++) {
    // 1.	Outer loop (for):
    //     •	Traverse the array using rightPointer, the right pointer of the window.
    //     •	Add the current element nums[rightPointer] to currSum.
    // 2.	Inner loop (while):
    //     •	When currSum is greater than or equal to target, the current subarray [leftPointer, rightPointer] is valid.
    //     •	Update res with the smaller value between its current value and the current window size (rightPointer + 1 - leftPointer).
    //     •	Shrink the window from the left (leftPointer++) by subtracting nums[leftPointer] from currSum.
    //     •	Continue shrinking the window as long as currSum is still >= target, looking for even smaller subarrays.
    currSum += nums[rightPointer];
    while (currSum >= target) {
      res = Math.min(res, rightPointer + 1 - leftPointer);
      currSum -= nums[leftPointer++];
    }
  }
  return res === Infinity ? 0 : res;
};