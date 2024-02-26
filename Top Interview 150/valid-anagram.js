/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function (s, t) {
  let charMap = new Map();
  for (const char of s) {
    let currOccurance = (charMap.get(char) || 0) + 1;
    charMap.set(char, currOccurance);
  }
  for (const char of t) {
    let currOccurance = 0;
    if (charMap.get(char)) {
      currOccurance = (charMap.get(char) || 0) - 1;
    } else {
      currOccurance = (charMap.get(char) || 0) + 1;
    }
    charMap.set(char, currOccurance);
  }
  for (const [key, val] of charMap) {
    if (val > 0) {
      return false;
    }
  }
  return true;
};
