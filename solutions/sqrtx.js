/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  if (x < 2) return x;
  let low = 0,
    high = x / 2;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    // check if expected number is in between current number's square and next number's square
    if (mid * mid <= x && x < (mid + 1) * (mid + 1)) {
      return mid;
    } else if (mid * mid > x) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return -1;
};
