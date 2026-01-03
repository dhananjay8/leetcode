/**
 * Problem: Longest Common Prefix
 * Link: https://leetcode.com/problems/longest-common-prefix/
 * Difficulty: Easy
 * 
 * Find the longest common prefix string amongst an array of strings.
 * If there is no common prefix, return an empty string "".
 * 
 * Example:
 * Input: strs = ["flower","flow","flight"]
 * Output: "fl"
 * 
 * Time Complexity: O(S) where S is the sum of all characters in all strings
 * Space Complexity: O(1)
 */

// JavaScript Solution
function longestCommonPrefix(strs) {
    if (!strs || strs.length === 0) return "";
    
    // Start with the first string as the prefix
    let prefix = strs[0];
    
    // Compare with each string
    for (let i = 1; i < strs.length; i++) {
        // Reduce prefix length until it matches the beginning of strs[i]
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1);
            if (prefix === "") return "";
        }
    }
    
    return prefix;
}

// Alternative solution - vertical scanning
function longestCommonPrefixVertical(strs) {
    if (!strs || strs.length === 0) return "";
    
    // Check character by character
    for (let i = 0; i < strs[0].length; i++) {
        const char = strs[0][i];
        
        // Check if this character exists at position i in all strings
        for (let j = 1; j < strs.length; j++) {
            if (i === strs[j].length || strs[j][i] !== char) {
                return strs[0].substring(0, i);
            }
        }
    }
    
    return strs[0];
}

// Test cases
console.log(longestCommonPrefix(["flower","flow","flight"])); // "fl"
console.log(longestCommonPrefix(["dog","racecar","car"])); // ""
console.log(longestCommonPrefix(["interspecies","interstellar","interstate"])); // "inters"

module.exports = longestCommonPrefix;

/* Python Solution (commented):

def longest_common_prefix(strs: list[str]) -> str:
    """
    Find the longest common prefix among an array of strings
    
    Args:
        strs: List of strings
    
    Returns:
        Longest common prefix string
    """
    if not strs:
        return ""
    
    # Start with the first string as prefix
    prefix = strs[0]
    
    # Compare with each string
    for i in range(1, len(strs)):
        # Reduce prefix length until it matches the beginning of strs[i]
        while not strs[i].startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    
    return prefix

# Alternative Python solution - vertical scanning
def longest_common_prefix_vertical(strs: list[str]) -> str:
    """Using vertical scanning approach"""
    if not strs:
        return ""
    
    # Check character by character
    for i in range(len(strs[0])):
        char = strs[0][i]
        
        # Check if this character exists at position i in all strings
        for j in range(1, len(strs)):
            if i == len(strs[j]) or strs[j][i] != char:
                return strs[0][:i]
    
    return strs[0]

# Test cases
print(longest_common_prefix(["flower","flow","flight"]))  # "fl"
print(longest_common_prefix(["dog","racecar","car"]))  # ""
print(longest_common_prefix(["interspecies","interstellar","interstate"]))  # "inters"

*/
