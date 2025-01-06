/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isSubsequence = function (s, t) {
  let i = 0,
    j = 0;
  // Iterate on both
  while (i < s.length && j < t.length) {
    // If current substring char matches actual string, then increment the substring index
    if (s[i] === t[j]) {
      i++;
    }
    j++;
  }
  // check if we are able to iterate till the end of substring i.e. 's'
  return i === s.length;
};
