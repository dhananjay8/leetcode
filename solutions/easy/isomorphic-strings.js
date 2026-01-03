/**
 * Problem: Isomorphic Strings
 * Link: https://leetcode.com/problems/isomorphic-strings/
 * Difficulty: Easy
 *
 * Given two strings s and t, determine if they are isomorphic.
 * Two strings are isomorphic if the characters in s can be replaced to get t.
 * No two characters may map to the same character, but a character may map to itself.
 *
 * Example:
 * Input: s = "egg", t = "add"
 * Output: true
 *
 * Input: s = "foo", t = "bar"
 * Output: false
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1) - limited charset
 */

// JavaScript Solution - Two HashMaps
function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;

  const mapST = new Map();
  const mapTS = new Map();

  for (let i = 0; i < s.length; i++) {
    const charS = s[i];
    const charT = t[i];

    // Check s -> t mapping
    if (mapST.has(charS)) {
      if (mapST.get(charS) !== charT) {
        return false;
      }
    } else {
      mapST.set(charS, charT);
    }

    // Check t -> s mapping (ensure bijection)
    if (mapTS.has(charT)) {
      if (mapTS.get(charT) !== charS) {
        return false;
      }
    } else {
      mapTS.set(charT, charS);
    }
  }

  return true;
}

// Alternative: Single pass with Set
function isIsomorphicSet(s, t) {
  if (s.length !== t.length) return false;

  const mapS = new Map();
  const usedT = new Set();

  for (let i = 0; i < s.length; i++) {
    const charS = s[i];
    const charT = t[i];

    if (mapS.has(charS)) {
      if (mapS.get(charS) !== charT) {
        return false;
      }
    } else {
      if (usedT.has(charT)) {
        return false;
      }
      mapS.set(charS, charT);
      usedT.add(charT);
    }
  }

  return true;
}

// Test cases
console.log(isIsomorphic("egg", "add")); // true
console.log(isIsomorphic("foo", "bar")); // false
console.log(isIsomorphic("paper", "title")); // true

module.exports = isIsomorphic;

/* Python Solution (commented):

def is_isomorphic(s: str, t: str) -> bool:
    """
    Check if two strings are isomorphic
    
    Args:
        s: First string
        t: Second string
    
    Returns:
        True if isomorphic, False otherwise
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if len(s) != len(t):
        return False
    
    map_st = {}
    map_ts = {}
    
    for char_s, char_t in zip(s, t):
        # Check s -> t mapping
        if char_s in map_st:
            if map_st[char_s] != char_t:
                return False
        else:
            map_st[char_s] = char_t
        
        # Check t -> s mapping
        if char_t in map_ts:
            if map_ts[char_t] != char_s:
                return False
        else:
            map_ts[char_t] = char_s
    
    return True

# Alternative: Using set
def is_isomorphic_set(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    
    map_s = {}
    used_t = set()
    
    for char_s, char_t in zip(s, t):
        if char_s in map_s:
            if map_s[char_s] != char_t:
                return False
        else:
            if char_t in used_t:
                return False
            map_s[char_s] = char_t
            used_t.add(char_t)
    
    return True

# Test cases
print(is_isomorphic("egg", "add"))  # True
print(is_isomorphic("foo", "bar"))  # False
print(is_isomorphic("paper", "title"))  # True

*/
