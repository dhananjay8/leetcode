/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
var combine = function(n, k) {
    const result = [];
    
    // Backtracking function to generate combinations
    function backtrack(start, current) {
        // If the current combination has size k, add it to result
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        
        // Iterate through remaining numbers
        // Optimization: only go up to n - (k - current.length) + 1
        for (let i = start; i <= n - (k - current.length) + 1; i++) {
            // Add current number to combination
            current.push(i);
            // Recurse with next starting number
            backtrack(i + 1, current);
            // Backtrack: remove current number
            current.pop();
        }
    }
    
    // Start backtracking from number 1
    backtrack(1, []);
    return result;
};

// Test cases
console.log(combine(4, 2)); // [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
console.log(combine(1, 1)); // [[1]]
console.log(combine(3, 3)); // [[1,2,3]]
