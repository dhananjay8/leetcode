/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
var strStr = function (haystack, needle) {
  if (haystack.length < needle.length) return -1;
  if (needle.length === 0 || haystack === needle) return 0;
  for (let i = 0; i < haystack.length - needle.length + 1; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return i;
    }
  }
  return -1;
};

// class Solution:
//     def strStr(self, haystack: str, needle: str) -> int:
//         if len(needle) > len(haystack):
//             return -1
//         if haystack == needle:
//             return 0
//         for i in range(len(haystack) - len(needle) + 1):
//             for j in range(len(needle)):
//                 if haystack[i + j] != needle[j]:
//                     break
//             else:
//                 return i

//         return -1
