/**
 * Problem: Spiral Matrix
 * Link: https://leetcode.com/problems/spiral-matrix/
 * Difficulty: Medium
 *
 * Given an m x n matrix, return all elements of the matrix in spiral order.
 *
 * Example:
 * Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
 * Output: [1,2,3,6,9,8,7,4,5]
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Layer by Layer
function spiralOrder(matrix) {
  if (!matrix || matrix.length === 0) return [];

  const result = [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    // Traverse right
    for (let col = left; col <= right; col++) {
      result.push(matrix[top][col]);
    }
    top++;

    // Traverse down
    for (let row = top; row <= bottom; row++) {
      result.push(matrix[row][right]);
    }
    right--;

    // Traverse left (if there's a row remaining)
    if (top <= bottom) {
      for (let col = right; col >= left; col--) {
        result.push(matrix[bottom][col]);
      }
      bottom--;
    }

    // Traverse up (if there's a column remaining)
    if (left <= right) {
      for (let row = bottom; row >= top; row--) {
        result.push(matrix[row][left]);
      }
      left++;
    }
  }

  return result;
}

// Test cases
console.log(
  spiralOrder([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ])
);
// [1,2,3,6,9,8,7,4,5]

console.log(
  spiralOrder([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ])
);
// [1,2,3,4,8,12,11,10,9,5,6,7]

module.exports = spiralOrder;

/* Python Solution (commented):

def spiral_order(matrix: list[list[int]]) -> list[int]:
    """
    Return matrix elements in spiral order
    
    Args:
        matrix: 2D matrix
    
    Returns:
        List of elements in spiral order
    
    Time Complexity: O(m * n)
    Space Complexity: O(1)
    """
    if not matrix:
        return []
    
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    
    while top <= bottom and left <= right:
        # Traverse right
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1
        
        # Traverse down
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1
        
        # Traverse left
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1
        
        # Traverse up
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1
    
    return result

# Test cases
print(spiral_order([[1,2,3],[4,5,6],[7,8,9]]))
# [1, 2, 3, 6, 9, 8, 7, 4, 5]

print(spiral_order([[1,2,3,4],[5,6,7,8],[9,10,11,12]]))
# [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]

*/
