/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  let seen = new Map();
  let maxLen = 0;
  let start = 0;
  for (let end = 0; end < s.length; end++) {
    // •	If the character at s[end] is found in seen and its stored index is greater than or equal to start, update start to seen.get(s[end]) + 1.
    // •	This ensures the new substring starts after the last occurrence of the repeating character.
    if (seen.has(s[end])) {
      start = Math.max(start, seen.get(s[end]) + 1);
    }
    seen.set(s[end], end);
    maxLen = Math.max(maxLen, end - start + 1);
    console.log("seen--", start, end, s[end], seen, maxLen);
  }
  return maxLen;
};