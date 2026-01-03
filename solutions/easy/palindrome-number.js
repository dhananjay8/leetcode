/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function (x) {
  if (x < 0) return false;
  let copy = x;
  let reverse = 0;
  while (copy > 0) {
    let lastDigit = copy % 10;
    reverse = reverse * 10 + lastDigit;
    copy = Math.floor(copy / 10);
  }
  return reverse === x;
};
