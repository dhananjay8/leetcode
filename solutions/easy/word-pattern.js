/**
 * Problem: Word Pattern
 * Link: https://leetcode.com/problems/word-pattern/
 * Difficulty: Easy
 * 
 * Given a pattern and a string s, find if s follows the same pattern.
 * 
 * Example:
 * Input: pattern = "abba", s = "dog cat cat dog"
 * Output: true
 * 
 * Time Complexity: O(n) where n is the number of words
 * Space Complexity: O(n) for the hash maps
 */

// JavaScript Solution
function wordPattern(pattern, s) {
    const words = s.split(' ');
    
    // If lengths don't match, pattern can't match
    if (pattern.length !== words.length) return false;
    
    const patternToWord = new Map();
    const wordToPattern = new Map();
    
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        const word = words[i];
        
        // Check if pattern char is already mapped
        if (patternToWord.has(char)) {
            if (patternToWord.get(char) !== word) return false;
        } else {
            patternToWord.set(char, word);
        }
        
        // Check if word is already mapped
        if (wordToPattern.has(word)) {
            if (wordToPattern.get(word) !== char) return false;
        } else {
            wordToPattern.set(word, char);
        }
    }
    
    return true;
}

// Test cases
console.log(wordPattern("abba", "dog cat cat dog")); // true
console.log(wordPattern("abba", "dog cat cat fish")); // false
console.log(wordPattern("aaaa", "dog cat cat dog")); // false

module.exports = wordPattern;

/* Python Solution (commented):

def word_pattern(pattern: str, s: str) -> bool:
    """
    Determines if string s follows the pattern
    
    Args:
        pattern: Pattern string (e.g., "abba")
        s: String to check (e.g., "dog cat cat dog")
    
    Returns:
        True if s follows pattern, False otherwise
    """
    words = s.split()
    
    # If lengths don't match, pattern can't match
    if len(pattern) != len(words):
        return False
    
    pattern_to_word = {}
    word_to_pattern = {}
    
    for char, word in zip(pattern, words):
        # Check if pattern char is already mapped
        if char in pattern_to_word:
            if pattern_to_word[char] != word:
                return False
        else:
            pattern_to_word[char] = word
        
        # Check if word is already mapped
        if word in word_to_pattern:
            if word_to_pattern[word] != char:
                return False
        else:
            word_to_pattern[word] = char
    
    return True

# Test cases
print(word_pattern("abba", "dog cat cat dog"))  # True
print(word_pattern("abba", "dog cat cat fish"))  # False
print(word_pattern("aaaa", "dog cat cat dog"))  # False

*/
