/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @param {number} k
 * @return {number[][]}
 */
var kSmallestPairs = function(nums1, nums2, k) {
    if (!nums1.length || !nums2.length || k === 0) return [];
    
    // Min heap to store pairs [sum, i, j]
    // We'll use an array and sort it to simulate heap operations
    const minHeap = [];
    
    // Initialize heap with first k elements from nums1 paired with nums2[0]
    // This is because pairs are formed by taking one element from each array
    const initialCount = Math.min(k, nums1.length);
    for (let i = 0; i < initialCount; i++) {
        minHeap.push([nums1[i] + nums2[0], i, 0]);
    }
    
    const result = [];
    
    // Extract k smallest pairs
    while (result.length < k && minHeap.length > 0) {
        // Sort to get minimum sum pair
        minHeap.sort((a, b) => a[0] - b[0]);
        const [sum, i, j] = minHeap.shift();
        
        result.push([nums1[i], nums2[j]]);
        
        // If there's a next element in nums2, add the next pair
        if (j + 1 < nums2.length) {
            minHeap.push([nums1[i] + nums2[j + 1], i, j + 1]);
        }
    }
    
    return result;
};

// Test cases
console.log(kSmallestPairs([1,7,11], [2,4,6], 3)); // [[1,2],[1,4],[1,6]]
console.log(kSmallestPairs([1,1,2], [1,2,3], 2)); // [[1,1],[1,1]]
console.log(kSmallestPairs([1,2], [3], 3)); // [[1,3],[2,3]]
