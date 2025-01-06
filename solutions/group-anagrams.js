/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
  const map = new Map();

  for (let str of strs) {
    let charCounts = Array(26).fill(0);
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) - "a".charCodeAt(0);
      charCounts[charCode]++;
    }

    const key = charCounts.join(",");

    if (map.has(key)) {
      map.get(key).push(str);
    } else {
      map.set(key, [str]);
    }
  }

  return Array.from(map.values());
};
