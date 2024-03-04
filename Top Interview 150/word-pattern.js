/**
 * @param {string} pattern
 * @param {string} s
 * @return {boolean}
 */
var wordPattern = function (pattern, s) {
  let wordMap = {};
  let words = s.split(" ");
  if (pattern.length !== words.length) return false;
  if (new Set(pattern).size !== new Set(words).size) return false;
  for (let i = 0; i < pattern.length; i++) {
    let char = pattern[i];
    if (wordMap[char] !== undefined && wordMap[char] !== words[i]) return false;
    wordMap[char] = words[i];
  }
  return true;
};
