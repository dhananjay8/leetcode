/**
 * Two Pointers — 6 Core Problems
 *
 * Template:
 *   left = 0, right = n-1
 *   while left < right:
 *     if condition: process; left++ or right--
 *
 * Problems:
 *   LC 11  — Container With Most Water (Medium)
 *   LC 15  — 3Sum (Medium)
 *   LC 26  — Remove Duplicates from Sorted Array (Easy)
 *   LC 42  — Trapping Rain Water (Hard)
 *   LC 75  — Sort Colors (Medium)
 *   LC 88  — Merge Sorted Array (Easy)
 */

// LC 11 — Container With Most Water — O(n)
function maxArea(height) {
  let left = 0, right = height.length - 1, res = 0;
  while (left < right) {
    res = Math.max(res, Math.min(height[left], height[right]) * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return res;
}

// LC 15 — 3Sum — O(n²)
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue; // skip duplicates
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        res.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left+1]) left++;
        while (left < right && nums[right] === nums[right-1]) right--;
        left++; right--;
      } else if (sum < 0) left++;
      else right--;
    }
  }
  return res;
}

// LC 26 — Remove Duplicates from Sorted Array — O(n)
function removeDuplicates(nums) {
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i-1]) nums[k++] = nums[i];
  }
  return k;
}

// LC 42 — Trapping Rain Water — O(n)
function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left++];
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right--];
    }
  }
  return water;
}

// LC 75 — Sort Colors (Dutch National Flag) — O(n)
function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) { [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++; }
    else if (nums[mid] === 1) { mid++; }
    else { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; }
  }
}

// LC 88 — Merge Sorted Array — O(m+n)
function merge(nums1, m, nums2, n) {
  let p1 = m - 1, p2 = n - 1, p = m + n - 1;
  while (p2 >= 0) {
    if (p1 >= 0 && nums1[p1] > nums2[p2]) nums1[p--] = nums1[p1--];
    else nums1[p--] = nums2[p2--];
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(maxArea([1,8,6,2,5,4,8,3,7]));    // 49
console.log(threeSum([-1,0,1,2,-1,-4]));       // [[-1,-1,2],[-1,0,1]]
console.log(trap([0,1,0,2,1,0,1,3,2,1,2,1])); // 6

const colors = [2,0,2,1,1,0];
sortColors(colors);
console.log(colors); // [0,0,1,1,2,2]

const nums1 = [1,2,3,0,0,0];
merge(nums1, 3, [2,5,6], 3);
console.log(nums1); // [1,2,2,3,5,6]

module.exports = { maxArea, threeSum, removeDuplicates, trap, sortColors, merge };
