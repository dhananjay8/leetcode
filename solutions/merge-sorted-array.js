/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function (nums1, m, nums2, n) {
  let k = m + n - 1;
  while (m > 0 && n > 0) {
    if (nums1[m - 1] > nums2[n - 1]) {
      nums1[k--] = nums1[m - 1];
      m--;
    } else {
      nums1[k--] = nums2[n - 1];
      n--;
    }
  }
  nums1.splice(0, n, ...nums2.slice(0, n));
};
