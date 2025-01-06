class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        arrLen = len(nums)
        arrSum = (arrLen*(arrLen+1))//2
        return arrSum - sum(nums)
        