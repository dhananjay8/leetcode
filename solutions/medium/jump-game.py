class Solution:
    def canJump(self, nums: List[int]) -> bool:
        n = len(nums)
        last_reachable = nums[0]
        for i in range(1, n):
            if i > last_reachable:
                return False
            last_reachable = max(last_reachable, i + nums[i])
        return True