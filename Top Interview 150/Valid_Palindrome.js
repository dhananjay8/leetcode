/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function (s) {
  // Converts to lowercase and removes all non-alphanumeric characters.
  let fs = s.toLowerCase().replace(/[^0-9a-z]/g, "");
  let l = 0,
    r = fs.length - 1;

  while (l < r) {
    if (fs[l] !== fs[r]) return false;
    l++;
    r--;
  }
  return true;
};
