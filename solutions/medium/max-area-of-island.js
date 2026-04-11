/**
 * Problem: Max Area of Island
 * Link: https://leetcode.com/problems/max-area-of-island/
 * Difficulty: Medium
 *
 * Return the maximum area of an island in the grid (connected 1s).
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n)
 */

// JavaScript Solution - DFS
function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  let maxArea = 0;

  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === 0) return 0;
    grid[r][c] = 0; // mark visited
    return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1);
  }

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === 1) maxArea = Math.max(maxArea, dfs(r, c));

  return maxArea;
}

module.exports = maxAreaOfIsland;

/* Python Solution:

def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0: return 0
        grid[r][c] = 0
        return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)
    
    return max((dfs(r,c) for r in range(rows) for c in range(cols) if grid[r][c] == 1), default=0)

*/
