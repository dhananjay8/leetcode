/**
 * Problem: Candy
 * Link: https://leetcode.com/problems/candy/
 * Difficulty: Hard
 *
 * There are n children standing in a line. Each child is assigned a rating value.
 * You are giving candies to these children subjected to the following requirements:
 * - Each child must have at least one candy.
 * - Children with a higher rating get more candies than their neighbors.
 *
 * Return the minimum number of candies you need to have to distribute.
 *
 * Example:
 * Input: ratings = [1,0,2]
 * Output: 5
 * Explanation: [2,1,2]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Two Pass
function candy(ratings) {
  const n = ratings.length;
  if (n === 0) return 0;

  const candies = new Array(n).fill(1);

  // Left to right pass - ensure right neighbor gets more if rating is higher
  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) {
      candies[i] = candies[i - 1] + 1;
    }
  }

  // Right to left pass - ensure left neighbor gets more if rating is higher
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1]) {
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);
    }
  }

  // Sum all candies
  return candies.reduce((sum, c) => sum + c, 0);
}

// Test cases
console.log(candy([1, 0, 2])); // 5
console.log(candy([1, 2, 2])); // 4
console.log(candy([1, 3, 2, 2, 1])); // 7

module.exports = candy;

/* Python Solution (commented):

def candy(ratings: list[int]) -> int:
    """
    Minimum candies to distribute following the rating rules
    
    Args:
        ratings: List of children ratings
    
    Returns:
        Minimum total candies needed
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    n = len(ratings)
    if n == 0:
        return 0
    
    candies = [1] * n
    
    # Left to right pass
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            candies[i] = candies[i - 1] + 1
    
    # Right to left pass
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            candies[i] = max(candies[i], candies[i + 1] + 1)
    
    # Sum all candies
    return sum(candies)

# Test cases
print(candy([1,0,2]))      # 5
print(candy([1,2,2]))      # 4
print(candy([1,3,2,2,1]))  # 7

*/
