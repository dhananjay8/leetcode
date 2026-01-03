/**
 * Problem: Happy Number
 * Link: https://leetcode.com/problems/happy-number/
 * Difficulty: Easy
 *
 * Write an algorithm to determine if a number n is happy.
 * A happy number is defined by: Starting with any positive integer, replace the number
 * by the sum of the squares of its digits. Repeat until the number equals 1 (happy),
 * or it loops endlessly in a cycle which does not include 1 (not happy).
 *
 * Example:
 * Input: n = 19
 * Output: true (1^2 + 9^2 = 82, 8^2 + 2^2 = 68, ..., eventually reaches 1)
 *
 * Time Complexity: O(log n)
 * Space Complexity: O(log n)
 */

// JavaScript Solution - HashSet for Cycle Detection
function isHappy(n) {
  const seen = new Set();

  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = getSumOfSquares(n);
  }

  return n === 1;
}

function getSumOfSquares(n) {
  let sum = 0;
  while (n > 0) {
    const digit = n % 10;
    sum += digit * digit;
    n = Math.floor(n / 10);
  }
  return sum;
}

// Alternative: Floyd's Cycle Detection (Slow/Fast pointers)
function isHappyFloyd(n) {
  let slow = n;
  let fast = n;

  do {
    slow = getSumOfSquares(slow);
    fast = getSumOfSquares(getSumOfSquares(fast));
  } while (slow !== fast);

  return slow === 1;
}

// Test cases
console.log(isHappy(19)); // true
console.log(isHappy(2)); // false
console.log(isHappy(1)); // true

module.exports = isHappy;

/* Python Solution (commented):

def is_happy(n: int) -> bool:
    """
    Determine if number is happy
    
    Args:
        n: Positive integer
    
    Returns:
        True if happy, False otherwise
    
    Time Complexity: O(log n)
    Space Complexity: O(log n)
    """
    seen = set()
    
    while n != 1 and n not in seen:
        seen.add(n)
        n = get_sum_of_squares(n)
    
    return n == 1

def get_sum_of_squares(n: int) -> int:
    total = 0
    while n > 0:
        digit = n % 10
        total += digit * digit
        n //= 10
    return total

# Alternative: Floyd's Cycle Detection
def is_happy_floyd(n: int) -> bool:
    slow = n
    fast = n
    
    while True:
        slow = get_sum_of_squares(slow)
        fast = get_sum_of_squares(get_sum_of_squares(fast))
        if slow == fast:
            break
    
    return slow == 1

# Test cases
print(is_happy(19))  # True
print(is_happy(2))  # False
print(is_happy(1))  # True

*/
