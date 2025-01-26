/**
 * @param {number[]} arr
 * @param {number} k
 * @param {number} x
 * @return {number[]}
 */
var findClosestElements = function (arr, k, x) {
  let left = 0;
  let right = arr.length - 1;

  // Use binary search to narrow the range to k elements
  while (right - left >= k) {
    if (Math.abs(arr[left] - x) > Math.abs(arr[right] - x)) {
      left++; // Remove the element farther from x on the left
    } else {
      right--; // Remove the element farther from x on the right
    }
  }

  // Return the k closest elements, which are guaranteed to be in the range [left, right]
  return arr.slice(left, left + k);
};

/**
 * @param {number[]} arr
 * @param {number} k
 * @param {number} x
 * @return {number[]}
 */
var findClosestElements = function (arr, k, x) {
  // Use a max-heap to store the closest elements
  const maxHeap = [];

  const pushToHeap = (dist, val) => {
    // Add the pair (distance, value) to the heap
    maxHeap.push([dist, val]);
    maxHeap.sort((a, b) => b[0] - a[0]); // Sort by descending distance
  };

  for (let num of arr) {
    const distance = Math.abs(num - x);
    pushToHeap(distance, num);

    // If the heap size exceeds k, remove the farthest element
    if (maxHeap.length > k) {
      maxHeap.pop();
    }
  }

  // Extract the elements from the heap and sort them
  const result = maxHeap.map(([_, val]) => val);
  return result.sort((a, b) => a - b);
};
