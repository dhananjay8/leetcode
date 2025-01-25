# /**
#  * @param {number[]} height - An array representing the heights of vertical lines.
#  * @return {number} - The maximum area that can be formed between two lines and the x-axis.
#  */
# var maxArea = function(height) {
#     let maxArea = 0; // Initialize the maximum area as 0
#     let l = 0; // Pointer starting at the leftmost index
#     let r = height.length - 1; // Pointer starting at the rightmost index

#     // Continue until the two pointers meet
#     while (l < r) {
#         // Calculate the area formed by the lines at indices `l` and `r`
#         // Area = min(height[l], height[r]) * (r - l)
#         // The shorter line limits the height of the container
#         maxArea = Math.max(maxArea, Math.min(height[l], height[r]) * (r - l));

#         // Move the pointer corresponding to the shorter line inward
#         // This is because the area is limited by the shorter line,
#         // and moving the pointer inward might find a taller line
#         height[l] < height[r] ? l++ : r--;
#     }

#     // Return the maximum area found
#     return maxArea;
# };


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
        