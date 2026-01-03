/**
 * Problem: Ransom Note
 * Link: https://leetcode.com/problems/ransom-note/
 * Difficulty: Easy
 *
 * Given two strings ransomNote and magazine, return true if ransomNote can be
 * constructed by using the letters from magazine and false otherwise.
 * Each letter in magazine can only be used once in ransomNote.
 *
 * Example:
 * Input: ransomNote = "a", magazine = "b"
 * Output: false
 *
 * Input: ransomNote = "aa", magazine = "aab"
 * Output: true
 *
 * Time Complexity: O(n + m)
 * Space Complexity: O(1) - limited to 26 lowercase letters
 */

// JavaScript Solution - HashMap
function canConstruct(ransomNote, magazine) {
  const charCount = new Map();

  // Count characters in magazine
  for (const char of magazine) {
    charCount.set(char, (charCount.get(char) || 0) + 1);
  }

  // Check if ransom note can be constructed
  for (const char of ransomNote) {
    if (!charCount.has(char) || charCount.get(char) === 0) {
      return false;
    }
    charCount.set(char, charCount.get(char) - 1);
  }

  return true;
}

// Alternative: Array (for lowercase letters only)
function canConstructArray(ransomNote, magazine) {
  const counts = new Array(26).fill(0);
  const aCode = "a".charCodeAt(0);

  // Count magazine letters
  for (const char of magazine) {
    counts[char.charCodeAt(0) - aCode]++;
  }

  // Check ransom note
  for (const char of ransomNote) {
    const index = char.charCodeAt(0) - aCode;
    if (counts[index] === 0) {
      return false;
    }
    counts[index]--;
  }

  return true;
}

// Test cases
console.log(canConstruct("a", "b")); // false
console.log(canConstruct("aa", "ab")); // false
console.log(canConstruct("aa", "aab")); // true

module.exports = canConstruct;

/* Python Solution (commented):

def can_construct(ransom_note: str, magazine: str) -> bool:
    """
    Check if ransom note can be constructed from magazine
    
    Args:
        ransom_note: Note to construct
        magazine: Available letters
    
    Returns:
        True if can construct, False otherwise
    
    Time Complexity: O(n + m)
    Space Complexity: O(1)
    """
    from collections import Counter
    
    magazine_count = Counter(magazine)
    ransom_count = Counter(ransom_note)
    
    for char, count in ransom_count.items():
        if magazine_count[char] < count:
            return False
    
    return True

# Alternative: Manual counting
def can_construct_manual(ransom_note: str, magazine: str) -> bool:
    char_count = {}
    
    # Count magazine chars
    for char in magazine:
        char_count[char] = char_count.get(char, 0) + 1
    
    # Check ransom note
    for char in ransom_note:
        if char_count.get(char, 0) == 0:
            return False
        char_count[char] -= 1
    
    return True

# Test cases
print(can_construct("a", "b"))  # False
print(can_construct("aa", "ab"))  # False
print(can_construct("aa", "aab"))  # True

*/
