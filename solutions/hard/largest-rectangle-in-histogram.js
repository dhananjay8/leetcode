/**
 * Problem: Largest Rectangle in Histogram
 * Link: https://leetcode.com/problems/largest-rectangle-in-histogram/
 * Difficulty: Hard
 *
 * Find the area of the largest rectangle in the histogram.
 *
 * Example: heights = [2,1,5,6,2,3] => 10
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Monotonic Stack
function largestRectangleArea(heights) {
  const stack = []; // indices of increasing heights
  let maxArea = 0;

  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i]; // sentinel 0 at end

    while (stack.length && h < heights[stack[stack.length - 1]]) {
      const height = heights[stack.pop()];
      // Width: from current index to the index after new stack top
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      maxArea = Math.max(maxArea, height * width);
    }

    stack.push(i);
  }

  return maxArea;
}

module.exports = largestRectangleArea;

/* Python Solution:

def largestRectangleArea(heights):
    stack = []
    max_area = 0
    
    for i in range(len(heights) + 1):
        h = heights[i] if i < len(heights) else 0
        
        while stack and h < heights[stack[-1]]:
            height = heights[stack.pop()]
            width = i - stack[-1] - 1 if stack else i
            max_area = max(max_area, height * width)
        
        stack.append(i)
    
    return max_area

*/
