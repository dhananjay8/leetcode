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

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  let set = new Set();
  let start = 0, maxLength = 0;

  for (let end = 0; end < s.length; end++) {
    // Use a while loop to remove characters from the set starting from the start pointer until the duplicate character is removed.
      while (set.has(s[end])) {
          set.delete(s[start]);
          start++;
      }
      set.add(s[end]);
      maxLength = Math.max(maxLength, end - start + 1);
  }

  return maxLength;
};

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  let maxLength = 0; // To store the length of the longest substring

  // Outer loop: Start of the substring
  for (let i = 0; i < s.length; i++) {
      let seen = new Set(); // To track characters in the current substring
      let currentLength = 0; // Length of the current substring

      // Inner loop: End of the substring
      for (let j = i; j < s.length; j++) {
          if (seen.has(s[j])) {
              // Break if a duplicate character is found
              break;
          }
          // Add the character to the set and update current substring length
          seen.add(s[j]);
          currentLength++;
      }

      // Update the maximum length
      maxLength = Math.max(maxLength, currentLength);
  }

  return maxLength; // Return the length of the longest substring
};