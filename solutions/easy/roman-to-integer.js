/**
 * Problem: Roman to Integer
 * Link: https://leetcode.com/problems/roman-to-integer/
 * Difficulty: Easy
 *
 * Convert a Roman numeral to an integer.
 * Roman numerals: I=1, V=5, X=10, L=50, C=100, D=500, M=1000
 *
 * Example:
 * Input: s = "MCMXCIV"
 * Output: 1994 (M=1000, CM=900, XC=90, IV=4)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution
function romanToInt(s) {
  const romanMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let result = 0;

  for (let i = 0; i < s.length; i++) {
    const current = romanMap[s[i]];
    const next = romanMap[s[i + 1]];

    // If current is less than next, subtract (e.g., IV, IX, XL)
    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }

  return result;
}

// Alternative: Right to left approach
function romanToIntRightToLeft(s) {
  const romanMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let result = 0;
  let prevValue = 0;

  for (let i = s.length - 1; i >= 0; i--) {
    const currentValue = romanMap[s[i]];

    if (currentValue < prevValue) {
      result -= currentValue;
    } else {
      result += currentValue;
    }

    prevValue = currentValue;
  }

  return result;
}

// Test cases
console.log(romanToInt("III")); // 3
console.log(romanToInt("LVIII")); // 58
console.log(romanToInt("MCMXCIV")); // 1994
console.log(romanToInt("IV")); // 4
console.log(romanToInt("IX")); // 9

module.exports = romanToInt;

/* Python Solution (commented):

def roman_to_int(s: str) -> int:
    """
    Convert Roman numeral to integer
    
    Args:
        s: Roman numeral string
    
    Returns:
        Integer value
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    roman_map = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000
    }
    
    result = 0
    
    for i in range(len(s)):
        current = roman_map[s[i]]
        next_val = roman_map.get(s[i + 1], 0) if i + 1 < len(s) else 0
        
        # Subtract if current < next (e.g., IV, IX)
        if current < next_val:
            result -= current
        else:
            result += current
    
    return result

# Alternative: Right to left
def roman_to_int_rtl(s: str) -> int:
    roman_map = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000
    }
    
    result = 0
    prev_value = 0
    
    for char in reversed(s):
        current_value = roman_map[char]
        
        if current_value < prev_value:
            result -= current_value
        else:
            result += current_value
        
        prev_value = current_value
    
    return result

# Test cases
print(roman_to_int("III"))  # 3
print(roman_to_int("LVIII"))  # 58
print(roman_to_int("MCMXCIV"))  # 1994
print(roman_to_int("IV"))  # 4
print(roman_to_int("IX"))  # 9

*/
