/**
 * Problem: Number of Islands
 * Link: https://leetcode.com/problems/number-of-islands/
 * Difficulty: Medium
 *
 * Given a 2D grid of '1's (land) and '0's (water), count the number of islands.
 *
 * Example: grid = [["1","1","0"],["1","1","0"],["0","0","1"]] => 2
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n) worst case for DFS stack
 */

// JavaScript Solution - DFS
function numIslands(grid) {
  if (!grid || !grid.length) return 0;

  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function dfs(r, c) {
    // Boundary check and water check
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') return;

    grid[r][c] = '0'; // mark as visited (sink the land)

    // Explore all 4 directions
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;      // found a new island
        dfs(r, c);    // sink all connected land
      }
    }
  }

  return count;
}

module.exports = numIslands;

/* Python Solution:

def numIslands(grid):
    if not grid:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == '0':
            return
        grid[r][c] = '0'  # mark visited
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    
    return count

*/
