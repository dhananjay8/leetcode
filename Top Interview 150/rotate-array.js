/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotate = function (nums, k) {
  if (k <= 0 || nums.length <= 1) {
    return nums;
  }
  if (k >= nums.length) {
    k = k % nums.length;
  }

  // Reverse the entire array
  reverse(nums, 0, nums.length - 1);
  // Reverse the first k elements
  reverse(nums, 0, k - 1);
  // Reverse the remaining elements
  reverse(nums, k, nums.length - 1);
};
var swap = function (A, i, j) {
  let data = A[i];
  A[i] = A[j];
  A[j] = data;
};

var reverse = function (A, low, high) {
  for (let i = low, j = high; i < j; i++, j--) {
    swap(A, i, j);
  }
};
