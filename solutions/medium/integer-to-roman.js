/**
 * Problem: Integer to Roman
 * Link: https://leetcode.com/problems/integer-to-roman/
 * Difficulty: Medium
 *
 * Convert an integer to a Roman numeral.
 *
 * Example:
 * Input: num = 1994
 * Output: "MCMXCIV"
 * Explanation: M = 1000, CM = 900, XC = 90, IV = 4
 *
 * Time Complexity: O(1) - fixed number of symbols
 * Space Complexity: O(1)
 */

// JavaScript Solution
function intToRoman(num) {
  // Value-symbol pairs in descending order
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];

  let result = "";

  for (let i = 0; i < values.length; i++) {
    // Use as many of the current symbol as needed
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }

  return result;
}

// Alternative solution using predefined mappings
function intToRomanAlt(num) {
  const thousands = ["", "M", "MM", "MMM"];
  const hundreds = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
  const tens = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
  const ones = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

  return (
    thousands[Math.floor(num / 1000)] +
    hundreds[Math.floor((num % 1000) / 100)] +
    tens[Math.floor((num % 100) / 10)] +
    ones[num % 10]
  );
}

// Test cases
console.log(intToRoman(3749)); // "MMMDCCXLIX"
console.log(intToRoman(58)); // "LVIII"
console.log(intToRoman(1994)); // "MCMXCIV"

module.exports = intToRoman;

/* Python Solution (commented):

def int_to_roman(num: int) -> str:
    """
    Convert integer to Roman numeral
    
    Args:
        num: Integer from 1 to 3999
    
    Returns:
        Roman numeral string
    
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    # Value-symbol pairs in descending order
    values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
    
    result = ""
    
    for i in range(len(values)):
        # Use as many of the current symbol as needed
        while num >= values[i]:
            result += symbols[i]
            num -= values[i]
    
    return result

# Alternative Python solution using predefined mappings
def int_to_roman_alt(num: int) -> str:
    """Using digit mappings"""
    thousands = ["", "M", "MM", "MMM"]
    hundreds = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"]
    tens = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"]
    ones = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]
    
    return (thousands[num // 1000] +
            hundreds[(num % 1000) // 100] +
            tens[(num % 100) // 10] +
            ones[num % 10])

# Test cases
print(int_to_roman(3749))  # "MMMDCCXLIX"
print(int_to_roman(58))    # "LVIII"
print(int_to_roman(1994))  # "MCMXCIV"

*/
