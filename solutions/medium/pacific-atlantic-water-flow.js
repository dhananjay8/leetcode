/**
 * Problem: Pacific Atlantic Water Flow
 * Link: https://leetcode.com/problems/pacific-atlantic-water-flow/
 * Difficulty: Medium
 *
 * Find cells where water can flow to both Pacific and Atlantic oceans.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n)
 */

// JavaScript Solution - DFS from ocean borders
function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const pacific = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const atlantic = Array.from({ length: rows }, () => new Array(cols).fill(false));

  function dfs(r, c, reachable, prevHeight) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (reachable[r][c] || heights[r][c] < prevHeight) return;
    reachable[r][c] = true;
    dfs(r+1,c,reachable,heights[r][c]); dfs(r-1,c,reachable,heights[r][c]);
    dfs(r,c+1,reachable,heights[r][c]); dfs(r,c-1,reachable,heights[r][c]);
  }

  // DFS from Pacific borders (top row + left col)
  for (let c = 0; c < cols; c++) { dfs(0,c,pacific,0); dfs(rows-1,c,atlantic,0); }
  for (let r = 0; r < rows; r++) { dfs(r,0,pacific,0); dfs(r,cols-1,atlantic,0); }

  // Collect cells reachable from both oceans
  const result = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);

  return result;
}

module.exports = pacificAtlantic;

/* Python Solution:

def pacificAtlantic(heights):
    rows, cols = len(heights), len(heights[0])
    pacific, atlantic = set(), set()
    
    def dfs(r, c, reachable, prev):
        if (r,c) in reachable or r<0 or r>=rows or c<0 or c>=cols: return
        if heights[r][c] < prev: return
        reachable.add((r,c))
        for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            dfs(r+dr, c+dc, reachable, heights[r][c])
    
    for c in range(cols):
        dfs(0,c,pacific,0); dfs(rows-1,c,atlantic,0)
    for r in range(rows):
        dfs(r,0,pacific,0); dfs(r,cols-1,atlantic,0)
    
    return list(pacific & atlantic)

*/
