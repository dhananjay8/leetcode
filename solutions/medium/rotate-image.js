/**
 * Problem: Rotate Image
 * Link: https://leetcode.com/problems/rotate-image/
 * Difficulty: Medium
 * 
 * You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).
 * You have to rotate the image in-place, which means you have to modify the input 2D matrix directly.
 * 
 * Example:
 * Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
 * Output: [[7,4,1],[8,5,2],[9,6,3]]
 * 
 * Time Complexity: O(n^2)
 * Space Complexity: O(1)
 */

// JavaScript Solution
function rotate(matrix) {
    const n = matrix.length;
    
    // Step 1: Transpose the matrix (swap matrix[i][j] with matrix[j][i])
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            // Swap elements
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    
    // Step 2: Reverse each row
    for (let i = 0; i < n; i++) {
        matrix[i].reverse();
    }
    
    return matrix;
}

// Alternative solution - rotate in layers
function rotateByLayers(matrix) {
    const n = matrix.length;
    
    // Process each layer from outside to inside
    for (let layer = 0; layer < Math.floor(n / 2); layer++) {
        const first = layer;
        const last = n - 1 - layer;
        
        for (let i = first; i < last; i++) {
            const offset = i - first;
            
            // Save top element
            const top = matrix[first][i];
            
            // Move left to top
            matrix[first][i] = matrix[last - offset][first];
            
            // Move bottom to left
            matrix[last - offset][first] = matrix[last][last - offset];
            
            // Move right to bottom
            matrix[last][last - offset] = matrix[i][last];
            
            // Move top to right
            matrix[i][last] = top;
        }
    }
    
    return matrix;
}

// Test cases
console.log(rotate([[1,2,3],[4,5,6],[7,8,9]]));
// Output: [[7,4,1],[8,5,2],[9,6,3]]

console.log(rotate([[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]));
// Output: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]

module.exports = rotate;

/* Python Solution (commented):

def rotate(matrix: list[list[int]]) -> None:
    """
    Rotate the matrix 90 degrees clockwise in-place
    
    Args:
        matrix: n x n 2D matrix to rotate
    
    Note: Modifies the matrix in-place, doesn't return anything
    """
    n = len(matrix)
    
    # Step 1: Transpose the matrix (swap matrix[i][j] with matrix[j][i])
    for i in range(n):
        for j in range(i + 1, n):
            # Swap elements
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    
    # Step 2: Reverse each row
    for i in range(n):
        matrix[i].reverse()

# Alternative Python solution - rotate in layers
def rotate_by_layers(matrix: list[list[int]]) -> None:
    """Rotate by processing each layer from outside to inside"""
    n = len(matrix)
    
    # Process each layer from outside to inside
    for layer in range(n // 2):
        first = layer
        last = n - 1 - layer
        
        for i in range(first, last):
            offset = i - first
            
            # Save top element
            top = matrix[first][i]
            
            # Move left to top
            matrix[first][i] = matrix[last - offset][first]
            
            # Move bottom to left
            matrix[last - offset][first] = matrix[last][last - offset]
            
            # Move right to bottom
            matrix[last][last - offset] = matrix[i][last]
            
            # Move top to right
            matrix[i][last] = top

# Test cases
matrix1 = [[1,2,3],[4,5,6],[7,8,9]]
rotate(matrix1)
print(matrix1)  # [[7,4,1],[8,5,2],[9,6,3]]

matrix2 = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
rotate(matrix2)
print(matrix2)  # [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]

*/
