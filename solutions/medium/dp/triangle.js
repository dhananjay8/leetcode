/**
 * @param {number[][]} triangle
 * @return {number}
 */
var minimumTotal = function(triangle) {
    if (!triangle || triangle.length === 0) return 0;
    
    // Start from the second last row and work upwards
    for (let row = triangle.length - 2; row >= 0; row--) {
        for (let col = 0; col < triangle[row].length; col++) {
            // Update current cell with minimum path sum from below
            triangle[row][col] += Math.min(
                triangle[row + 1][col],     // directly below
                triangle[row + 1][col + 1]  // below and to the right
            );
        }
    }
    
    // The top element now contains the minimum path sum
    return triangle[0][0];
};

// Test cases
console.log(minimumTotal([[2],[3,4],[6,5,7],[4,1,8,3]])); // 11
console.log(minimumTotal([[-10]])); // -10
console.log(minimumTotal([[1],[2,3],[4,5,6]])); // 7
