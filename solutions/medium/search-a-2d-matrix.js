/**
 * Problem: Search a 2D Matrix
 * Link: https://leetcode.com/problems/search-a-2d-matrix/
 * Difficulty: Medium
 *
 * Each row sorted left to right. First integer of each row > last integer of previous row.
 * Search for a target value.
 *
 * Time Complexity: O(log(m*n))
 * Space Complexity: O(1)
 */

// JavaScript Solution - Treat as 1D sorted array, single binary search
function searchMatrix(matrix, target) {
  const m = matrix.length, n = matrix[0].length;
  let lo = 0, hi = m * n - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const row = Math.floor(mid / n); // convert 1D index to 2D
    const col = mid % n;
    const val = matrix[row][col];

    if (val === target) return true;
    else if (val < target) lo = mid + 1;
    else hi = mid - 1;
  }

  return false;
}

module.exports = searchMatrix;

/* Python Solution:

def searchMatrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    lo, hi = 0, m * n - 1
    
    while lo <= hi:
        mid = (lo + hi) // 2
        val = matrix[mid // n][mid % n]  # map 1D index to 2D
        
        if val == target: return True
        elif val < target: lo = mid + 1
        else: hi = mid - 1
    
    return False

*/
