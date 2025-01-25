/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function (height) {
  if (height == null || height.length === 0) return 0;

  let l = 0;
  let r = height.length - 1;

  let lMax = 0;
  let rMax = 0;

  let res = 0;

  while (l < r) {
    lMax = Math.max(lMax, height[l]);
    // If this iteration does not have (not contributed to) the maximum left height, calculate water stored in the gap.
    if (height[l] < lMax) {
      res += lMax - height[l];
    }

    rMax = Math.max(rMax, height[r]);
    // If this iteration does not have (not contributed to) the maximum right height, calculate water stored in the gap.
    if (height[r] < rMax) {
      res += rMax - height[r];
    }

    height[l] < height[r] ? l++ : r--;
  }

  return res;
};
