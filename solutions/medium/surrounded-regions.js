/**
 * Problem: Surrounded Regions
 * Link: https://leetcode.com/problems/surrounded-regions/
 * Difficulty: Medium
 *
 * Capture all regions that are 4-directionally surrounded by 'X'.
 * A region is NOT captured if connected to the border.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n)
 */

// JavaScript Solution - DFS from borders
function solve(board) {
  if (!board || !board.length) return;

  const rows = board.length, cols = board[0].length;

  // Mark border-connected 'O's as safe (change to 'S')
  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== 'O') return;
    board[r][c] = 'S'; // safe, connected to border
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  // Step 1: DFS from all border 'O's
  for (let r = 0; r < rows; r++) {
    if (board[r][0] === 'O') dfs(r, 0);
    if (board[r][cols - 1] === 'O') dfs(r, cols - 1);
  }
  for (let c = 0; c < cols; c++) {
    if (board[0][c] === 'O') dfs(0, c);
    if (board[rows - 1][c] === 'O') dfs(rows - 1, c);
  }

  // Step 2: Flip remaining 'O' -> 'X' (captured), 'S' -> 'O' (restore safe)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'O') board[r][c] = 'X';
      else if (board[r][c] === 'S') board[r][c] = 'O';
    }
  }
}

module.exports = solve;

/* Python Solution:

def solve(board):
    if not board:
        return
    
    rows, cols = len(board), len(board[0])
    
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != 'O':
            return
        board[r][c] = 'S'  # mark as safe
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)
    
    # Mark border-connected O's
    for r in range(rows):
        dfs(r, 0); dfs(r, cols-1)
    for c in range(cols):
        dfs(0, c); dfs(rows-1, c)
    
    # Flip: O->X (captured), S->O (safe)
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == 'O': board[r][c] = 'X'
            elif board[r][c] == 'S': board[r][c] = 'O'

*/
