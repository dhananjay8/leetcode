/**
 * Problem: Reverse Words in a String
 * Link: https://leetcode.com/problems/reverse-words-in-a-string/
 * Difficulty: Medium
 *
 * Given an input string s, reverse the order of the words.
 * A word is defined as a sequence of non-space characters.
 *
 * Example:
 * Input: s = "the sky is blue"
 * Output: "blue is sky the"
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Built-in methods
function reverseWords(s) {
  return s.trim().split(/\s+/).reverse().join(" ");
}

// Alternative: Manual approach without built-in reverse
function reverseWordsManual(s) {
  const words = [];
  let word = "";

  // Extract words
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== " ") {
      word += s[i];
    } else if (word.length > 0) {
      words.push(word);
      word = "";
    }
  }

  // Don't forget last word
  if (word.length > 0) {
    words.push(word);
  }

  // Reverse and join
  let result = "";
  for (let i = words.length - 1; i >= 0; i--) {
    result += words[i];
    if (i > 0) result += " ";
  }

  return result;
}

// Test cases
console.log(reverseWords("the sky is blue")); // "blue is sky the"
console.log(reverseWords("  hello world  ")); // "world hello"
console.log(reverseWords("a good   example")); // "example good a"

module.exports = reverseWords;

/* Python Solution (commented):

def reverse_words(s: str) -> str:
    """
    Reverse words in a string
    
    Args:
        s: Input string
    
    Returns:
        String with reversed word order
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    return ' '.join(reversed(s.split()))

# Alternative: Manual approach
def reverse_words_manual(s: str) -> str:
    words = []
    word = ''
    
    # Extract words
    for char in s:
        if char != ' ':
            word += char
        elif word:
            words.append(word)
            word = ''
    
    # Don't forget last word
    if word:
        words.append(word)
    
    # Reverse and join
    return ' '.join(reversed(words))

# Alternative: Two-pass approach
def reverse_words_two_pass(s: str) -> str:
    # Split and filter empty strings
    words = [word for word in s.split() if word]
    # Reverse
    words.reverse()
    return ' '.join(words)

# Test cases
print(reverse_words("the sky is blue"))  # "blue is sky the"
print(reverse_words("  hello world  "))  # "world hello"
print(reverse_words("a good   example"))  # "example good a"

*/
