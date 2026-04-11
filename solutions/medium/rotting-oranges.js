/**
 * Problem: Rotting Oranges
 * Link: https://leetcode.com/problems/rotting-oranges/
 * Difficulty: Medium
 *
 * Every minute, fresh oranges adjacent to rotten ones become rotten. Return min minutes
 * until no fresh orange remains, or -1 if impossible.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n)
 */

// JavaScript Solution - Multi-source BFS
function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  const queue = [];
  let fresh = 0;

  // Find all rotten oranges and count fresh ones
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      if (grid[r][c] === 1) fresh++;
    }

  if (fresh === 0) return 0;

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let minutes = 0;

  while (queue.length && fresh > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const [r, c] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; // rot it
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
    minutes++;
  }

  return fresh === 0 ? minutes : -1;
}

module.exports = orangesRotting;

/* Python Solution:

from collections import deque

def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2: queue.append((r, c))
            if grid[r][c] == 1: fresh += 1
    
    if fresh == 0: return 0
    minutes = 0
    
    while queue and fresh > 0:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = r+dr, c+dc
                if 0<=nr<rows and 0<=nc<cols and grid[nr][nc]==1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    
    return minutes if fresh == 0 else -1

*/
