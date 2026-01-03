/**
 * Problem: Set Matrix Zeroes
 * Link: https://leetcode.com/problems/set-matrix-zeroes/
 * Difficulty: Medium
 * 
 * Given an m x n integer matrix, if an element is 0, set its entire row and column to 0's.
 * You must do it in place.
 * 
 * Example:
 * Input: matrix = [[1,1,1],[1,0,1],[1,1,1]]
 * Output: [[1,0,1],[0,0,0],[1,0,1]]
 * 
 * Time Complexity: O(m * n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Optimal O(1) space
function setZeroes(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;
    let firstRowZero = false;
    let firstColZero = false;
    
    // Check if first row needs to be zeroed
    for (let j = 0; j < n; j++) {
        if (matrix[0][j] === 0) {
            firstRowZero = true;
            break;
        }
    }
    
    // Check if first column needs to be zeroed
    for (let i = 0; i < m; i++) {
        if (matrix[i][0] === 0) {
            firstColZero = true;
            break;
        }
    }
    
    // Use first row and column as markers
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (matrix[i][j] === 0) {
                matrix[i][0] = 0;
                matrix[0][j] = 0;
            }
        }
    }
    
    // Set zeros based on markers (excluding first row and column)
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (matrix[i][0] === 0 || matrix[0][j] === 0) {
                matrix[i][j] = 0;
            }
        }
    }
    
    // Handle first row
    if (firstRowZero) {
        for (let j = 0; j < n; j++) {
            matrix[0][j] = 0;
        }
    }
    
    // Handle first column
    if (firstColZero) {
        for (let i = 0; i < m; i++) {
            matrix[i][0] = 0;
        }
    }
}

// Alternative solution with O(m + n) space
function setZeroesWithExtraSpace(matrix) {
    const m = matrix.length;
    const n = matrix[0].length;
    const rows = new Set();
    const cols = new Set();
    
    // Mark rows and columns that need to be zeroed
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] === 0) {
                rows.add(i);
                cols.add(j);
            }
        }
    }
    
    // Set marked rows to zero
    for (let row of rows) {
        for (let j = 0; j < n; j++) {
            matrix[row][j] = 0;
        }
    }
    
    // Set marked columns to zero
    for (let col of cols) {
        for (let i = 0; i < m; i++) {
            matrix[i][col] = 0;
        }
    }
}

// Test cases
const matrix1 = [[1,1,1],[1,0,1],[1,1,1]];
setZeroes(matrix1);
console.log(matrix1); // [[1,0,1],[0,0,0],[1,0,1]]

const matrix2 = [[0,1,2,0],[3,4,5,2],[1,3,1,5]];
setZeroes(matrix2);
console.log(matrix2); // [[0,0,0,0],[0,4,5,0],[0,3,1,0]]

module.exports = setZeroes;

/* Python Solution (commented):

def set_zeroes(matrix: list[list[int]]) -> None:
    """
    Set entire row and column to 0 if an element is 0.
    Modifies the matrix in-place.
    
    Args:
        matrix: m x n matrix to modify
    
    Time Complexity: O(m * n)
    Space Complexity: O(1)
    """
    m, n = len(matrix), len(matrix[0])
    first_row_zero = False
    first_col_zero = False
    
    # Check if first row needs to be zeroed
    for j in range(n):
        if matrix[0][j] == 0:
            first_row_zero = True
            break
    
    # Check if first column needs to be zeroed
    for i in range(m):
        if matrix[i][0] == 0:
            first_col_zero = True
            break
    
    # Use first row and column as markers
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][j] == 0:
                matrix[i][0] = 0
                matrix[0][j] = 0
    
    # Set zeros based on markers (excluding first row and column)
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    
    # Handle first row
    if first_row_zero:
        for j in range(n):
            matrix[0][j] = 0
    
    # Handle first column
    if first_col_zero:
        for i in range(m):
            matrix[i][0] = 0

# Alternative Python solution with O(m + n) space
def set_zeroes_with_extra_space(matrix: list[list[int]]) -> None:
    """Using extra space for rows and columns sets"""
    m, n = len(matrix), len(matrix[0])
    rows = set()
    cols = set()
    
    # Mark rows and columns that need to be zeroed
    for i in range(m):
        for j in range(n):
            if matrix[i][j] == 0:
                rows.add(i)
                cols.add(j)
    
    # Set marked rows to zero
    for row in rows:
        for j in range(n):
            matrix[row][j] = 0
    
    # Set marked columns to zero
    for col in cols:
        for i in range(m):
            matrix[i][col] = 0

# Test cases
matrix1 = [[1,1,1],[1,0,1],[1,1,1]]
set_zeroes(matrix1)
print(matrix1)  # [[1,0,1],[0,0,0],[1,0,1]]

matrix2 = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]
set_zeroes(matrix2)
print(matrix2)  # [[0,0,0,0],[0,4,5,0],[0,3,1,0]]

*/
