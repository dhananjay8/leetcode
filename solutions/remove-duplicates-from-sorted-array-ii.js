/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function (nums) {
  if (nums.length < 3) return nums.length; // If there are fewer than 3 elements, no need to modify

  let currIndex = 2; // Pointer to the position where the next valid element will be placed

  for (let i = 2; i < nums.length; i++) {
    if (nums[i] !== nums[currIndex - 2]) {
      nums[currIndex] = nums[i]; // Place the current element at the currIndex
      currIndex++; // Move currIndex forward
    }
  }

  return currIndex; // Return the length of the modified array
};
