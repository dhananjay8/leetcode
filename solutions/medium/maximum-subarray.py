# /**
#  * @param {number[]} nums
#  * @return {number}
#  */
# var maxSubArray = function(nums) {
#     let maxSum = -Infinity,
#         sumSoFar = 0;
    
#     for(let num of nums){
#         sumSoFar += num;
#         if(sumSoFar > maxSum) {maxSum = sumSoFar};
#         if(sumSoFar < 0) {sumSoFar = 0}
#         // sumSoFar = Math.max(num, sumSoFar + num); // Take the maximum of current element or adding it to sumSoFar
#         // maxSum = Math.max(maxSum, sumSoFar); // Update maxSum if sumSoFar is greater
#     }
    
#     return maxSum;
# };

class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        maxSum = float('-inf')
        sumSoFar = 0
        
        for num in nums:
            sumSoFar += num
            maxSum = max(maxSum, sumSoFar)
            if sumSoFar < 0: sumSoFar = 0

        return maxSum