/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
 */
var findAnagrams = function(s, p) {
    const result = [];
    if (!s || !p || s.length < p.length) return result;
    
    // Create frequency map for pattern p
    const pCount = new Array(26).fill(0);
    for (const char of p) {
        pCount[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
    }
    
    // Create sliding window frequency map for current window in s
    const windowCount = new Array(26).fill(0);
    const windowSize = p.length;
    
    // Initialize first window
    for (let i = 0; i < windowSize; i++) {
        windowCount[s.charCodeAt(i) - 'a'.charCodeAt(0)]++;
    }
    
    // Check if first window is an anagram
    if (arraysEqual(pCount, windowCount)) {
        result.push(0);
    }
    
    // Slide the window through the string
    for (let i = windowSize; i < s.length; i++) {
        // Remove the character that's sliding out of the window
        windowCount[s.charCodeAt(i - windowSize) - 'a'.charCodeAt(0)]--;
        
        // Add the new character that's sliding into the window
        windowCount[s.charCodeAt(i) - 'a'.charCodeAt(0)]++;
        
        // Check if current window is an anagram
        if (arraysEqual(pCount, windowCount)) {
            result.push(i - windowSize + 1);
        }
    }
    
    return result;
};

// Helper function to compare two arrays
function arraysEqual(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

// Test cases
console.log(findAnagrams("cbaebabacd", "abc")); // [0,6]
console.log(findAnagrams("abab", "ab")); // [0,1,2]
console.log(findAnagrams("aaaaaaaaaa", "aaaaaa")); // [0,1,2,3,4]
