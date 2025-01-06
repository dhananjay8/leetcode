/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
  if (!strs || strs.length === 0) return "";
  let shortestStr = strs[0];
  for (let str of strs) {
    shortestStr = shortestStr.length > str.length ? str : shortestStr;
  }
  for (let i = 0; i < shortestStr.length; i++) {
    for (let str of strs) {
      if (shortestStr[i] !== str[i]) return shortestStr.substring(0, i);
    }
  }
  return shortestStr;
};
