/**
 * Problem: Length of Last Word
 * Link: https://leetcode.com/problems/length-of-last-word/
 * Difficulty: Easy
 * 
 * Given a string s consisting of words and spaces, return the length of the last word in the string.
 * 
 * Example:
 * Input: s = "Hello World"
 * Output: 5
 * 
 * Time Complexity: O(n) where n is the length of the string
 * Space Complexity: O(1)
 */

// JavaScript Solution
function lengthOfLastWord(s) {
    // Trim trailing spaces and split by spaces
    const trimmed = s.trim();
    let length = 0;
    
    // Count from the end until we hit a space
    for (let i = trimmed.length - 1; i >= 0; i--) {
        if (trimmed[i] === ' ') {
            break;
        }
        length++;
    }
    
    return length;
}

// Alternative solution using split
function lengthOfLastWordAlt(s) {
    const words = s.trim().split(' ');
    return words[words.length - 1].length;
}

// Test cases
console.log(lengthOfLastWord("Hello World")); // 5
console.log(lengthOfLastWord("   fly me   to   the moon  ")); // 4
console.log(lengthOfLastWord("luffy is still joyboy")); // 6

module.exports = lengthOfLastWord;

/* Python Solution (commented):

def length_of_last_word(s: str) -> int:
    """
    Returns the length of the last word in the string
    
    Args:
        s: Input string with words separated by spaces
    
    Returns:
        Length of the last word
    """
    # Trim and count from the end
    trimmed = s.strip()
    length = 0
    
    for i in range(len(trimmed) - 1, -1, -1):
        if trimmed[i] == ' ':
            break
        length += 1
    
    return length

# Alternative Python solution
def length_of_last_word_alt(s: str) -> int:
    """Using split() method"""
    words = s.strip().split()
    return len(words[-1]) if words else 0

# Test cases
print(length_of_last_word("Hello World"))  # 5
print(length_of_last_word("   fly me   to   the moon  "))  # 4
print(length_of_last_word("luffy is still joyboy"))  # 6

*/
