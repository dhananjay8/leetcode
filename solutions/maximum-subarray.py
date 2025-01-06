class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        maxSum = float('-inf')
        sumSoFar = 0
        
        for num in nums:
            sumSoFar += num
            maxSum = max(maxSum, sumSoFar)
            if sumSoFar < 0: sumSoFar = 0

        return maxSum