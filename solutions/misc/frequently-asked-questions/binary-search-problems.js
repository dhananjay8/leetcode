/**
 * Binary Search — 4 Core Problems
 *
 * Template:
 *   lo = 0, hi = n-1
 *   while lo <= hi:
 *     mid = (lo + hi) >> 1
 *     if check(mid): answer = mid; hi = mid-1  (or lo = mid+1)
 *     else: lo = mid+1  (or hi = mid-1)
 *
 * Problems:
 *   LC 33  — Search in Rotated Sorted Array (Medium)
 *   LC 153 — Find Minimum in Rotated Sorted Array (Medium)
 *   LC 162 — Find Peak Element (Medium)
 *   LC 704 — Binary Search (Easy)
 */

// LC 704 — Binary Search — O(log n)
function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

// LC 33 — Search in Rotated Sorted Array — O(log n)
function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;

    // Left half is sorted
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      // Right half is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

// LC 153 — Find Minimum in Rotated Sorted Array — O(log n)
function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1; // min is in right half
    else hi = mid;                           // min is at mid or left
  }
  return nums[lo];
}

// LC 162 — Find Peak Element — O(log n)
// A peak is where nums[i] > nums[i-1] and nums[i] > nums[i+1]
function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[mid + 1]) hi = mid;     // peak is at mid or left
    else lo = mid + 1;                            // peak is right
  }
  return lo;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(search([1,2,3,4,5,6], 4));              // 3
console.log(searchRotated([4,5,6,7,0,1,2], 0));     // 4
console.log(searchRotated([4,5,6,7,0,1,2], 3));     // -1
console.log(findMin([3,4,5,1,2]));                  // 1
console.log(findMin([4,5,6,7,0,1,2]));              // 0
console.log(findPeakElement([1,2,3,1]));            // 2

module.exports = { search, searchRotated, findMin, findPeakElement };
