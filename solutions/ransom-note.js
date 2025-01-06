/**
 * @param {string} ransomNote
 * @param {string} magazine
 * @return {boolean}
 */
var canConstruct = function (ransomNote, magazine) {
  let charMap = new Map();
  for (const char of magazine) {
    let currOccurance = (charMap.get(char) || 0) + 1;
    charMap.set(char, currOccurance);
  }
  for (const char of ransomNote) {
    if (charMap.get(char) > 1) {
      charMap.set(char, charMap.get(char) - 1);
      continue;
    }
    if (charMap.get(char) == 1) {
      charMap.delete(char);
      continue;
    }
    if (!charMap.has(char)) {
      return false;
    }
  }
  return true;
};
