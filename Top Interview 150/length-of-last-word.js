/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLastWord = function (s) {
  let sLen = s.length;
  let cnt = 0;
  for (let i = sLen - 1; i >= 0; i--) {
    if (s[i] == " ") {
      if (cnt > 0) return cnt;
      continue;
    }
    cnt += 1;
  }
  return cnt;
};
