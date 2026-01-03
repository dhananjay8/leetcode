/**
 * Problem: Substring with Concatenation of All Words
 * Link: https://leetcode.com/problems/substring-with-concatenation-of-all-words/
 * Difficulty: Hard
 *
 * You are given a string s and an array of strings words of the same length.
 * Return all starting indices of substring(s) in s that is a concatenation of each word
 * in words exactly once, in any order, and without any intervening characters.
 *
 * Example:
 * Input: s = "barfoothefoobarman", words = ["foo","bar"]
 * Output: [0,9]
 *
 * Time Complexity: O(n * m * k) where n=len(s), m=len(words), k=word length
 * Space Complexity: O(m)
 */

// JavaScript Solution - Sliding Window with HashMap
function findSubstring(s, words) {
  if (!s || !words || words.length === 0) return [];

  const result = [];
  const wordLen = words[0].length;
  const wordCount = words.length;
  const totalLen = wordLen * wordCount;

  // Count frequency of each word
  const wordMap = new Map();
  for (const word of words) {
    wordMap.set(word, (wordMap.get(word) || 0) + 1);
  }

  // Try each possible starting position
  for (let i = 0; i <= s.length - totalLen; i++) {
    const seen = new Map();
    let j = 0;

    // Check each word in the substring
    while (j < wordCount) {
      const wordStart = i + j * wordLen;
      const word = s.substring(wordStart, wordStart + wordLen);

      if (!wordMap.has(word)) break;

      seen.set(word, (seen.get(word) || 0) + 1);

      if (seen.get(word) > wordMap.get(word)) break;

      j++;
    }

    if (j === wordCount) {
      result.push(i);
    }
  }

  return result;
}

// Test cases
console.log(findSubstring("barfoothefoobarman", ["foo", "bar"])); // [0,9]
console.log(
  findSubstring("wordgoodgoodgoodbestword", ["word", "good", "best", "word"])
); // []
console.log(findSubstring("barfoofoobarthefoobarman", ["bar", "foo", "the"])); // [6,9,12]

module.exports = findSubstring;

/* Python Solution (commented):

from collections import Counter

def find_substring(s: str, words: list[str]) -> list[int]:
    """
    Find all starting indices of concatenated substrings
    
    Args:
        s: Input string
        words: Array of words to concatenate
    
    Returns:
        List of starting indices
    
    Time Complexity: O(n * m * k)
    Space Complexity: O(m)
    """
    if not s or not words:
        return []
    
    result = []
    word_len = len(words[0])
    word_count = len(words)
    total_len = word_len * word_count
    
    # Count word frequencies
    word_map = Counter(words)
    
    # Try each starting position
    for i in range(len(s) - total_len + 1):
        seen = Counter()
        j = 0
        
        # Check each word
        while j < word_count:
            word_start = i + j * word_len
            word = s[word_start:word_start + word_len]
            
            if word not in word_map:
                break
            
            seen[word] += 1
            
            if seen[word] > word_map[word]:
                break
            
            j += 1
        
        if j == word_count:
            result.append(i)
    
    return result

# Test cases
print(find_substring("barfoothefoobarman", ["foo","bar"]))  # [0, 9]
print(find_substring("wordgoodgoodgoodbestword", ["word","good","best","word"]))  # []
print(find_substring("barfoofoobarthefoobarman", ["bar","foo","the"]))  # [6, 9, 12]

*/
