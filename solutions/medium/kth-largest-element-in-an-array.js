/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {
  const MinHeap = function () {
    this.heap = [];
  };

  MinHeap.prototype.push = function (val) {
    this.heap.push(val);
    this.heap.sort((a, b) => a - b);
  };

  MinHeap.prototype.pop = function () {
    return this.heap.shift();
  };

  MinHeap.prototype.size = function () {
    return this.heap.length;
  };

  let heap = new MinHeap();

  for (let num of nums) {
    heap.push(num);
    if (heap.size() > k) {
      heap.pop();
    }
  }

  return heap.heap[0];
};

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {
  // Find the smallest and largest values in the array
  const minValue = Math.min(...nums); // Minimum value in nums
  const maxValue = Math.max(...nums); // Maximum value in nums

  // Create a frequency array (count) to store the occurrences of each number
  // The size of the array is determined by the range of values: maxValue - minValue + 1
  const count = new Array(maxValue - minValue + 1).fill(0);

  // Fill the count array
  // For each number in nums, increment its respective position in the count array
  for (const num of nums) {
    count[num - minValue]++; // Map num to count array index using `num - minValue`
  }

  // Iterate backward over the count array to find the kth largest element
  let remaining = k; // Number of elements we need to find
  for (let i = count.length - 1; i >= 0; i--) {
    remaining -= count[i]; // Subtract the frequency of the current number from remaining

    // If remaining becomes 0 or less, we've found the kth largest element
    if (remaining <= 0) {
      return i + minValue; // Map the index back to the original number using `i + minValue`
    }
  }
};

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {
  const partition = (left, right) => {
    const pivot = nums[right];
    let partitionIndex = left;

    for (let i = left; i < right; i++) {
      if (nums[i] >= pivot) {
        // Descending order comparison
        [nums[i], nums[partitionIndex]] = [nums[partitionIndex], nums[i]];
        partitionIndex++;
      }
    }
    [nums[partitionIndex], nums[right]] = [nums[right], nums[partitionIndex]];
    return partitionIndex;
  };

  let left = 0,
    right = nums.length - 1;
  while (true) {
    const pivotIndex = partition(left, right);
    if (pivotIndex === k - 1) {
      return nums[pivotIndex];
    } else if (pivotIndex < k - 1) {
      left = pivotIndex + 1;
    } else {
      right = pivotIndex - 1;
    }
  }
};
