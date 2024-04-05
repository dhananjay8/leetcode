class Solution:
    def maxArea(self, height: List[int]) -> int:
        maxArea = float('-inf')
        l = 0
        r = len(height) - 1
        while l < r:
            maxArea = max(maxArea, min(height[l], height[r]) * (r-l))
            print(maxArea)
            if(height[l] < height[r]):
                l += 1
            else:
                r -= 1
        return maxArea
        