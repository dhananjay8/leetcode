/**
 * Problem: Word Search
 * Link: https://leetcode.com/problems/word-search/
 * Difficulty: Medium
 *
 * Given a board and a word, find if the word exists in the grid (adjacent cells).
 *
 * Time Complexity: O(m * n * 4^L) where L is word length
 * Space Complexity: O(L) recursion stack
 */

// JavaScript Solution - DFS Backtracking
function exist(board, word) {
  const rows = board.length, cols = board[0].length;

  function dfs(r, c, idx) {
    if (idx === word.length) return true; // found complete word
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[idx]) return false;

    const temp = board[r][c];
    board[r][c] = '#'; // mark visited

    const found = dfs(r+1,c,idx+1) || dfs(r-1,c,idx+1) ||
                  dfs(r,c+1,idx+1) || dfs(r,c-1,idx+1);

    board[r][c] = temp; // restore (backtrack)
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}

module.exports = exist;

/* Python Solution:

def exist(board, word):
    rows, cols = len(board), len(board[0])
    
    def dfs(r, c, idx):
        if idx == len(word): return True
        if r<0 or r>=rows or c<0 or c>=cols or board[r][c] != word[idx]:
            return False
        
        temp, board[r][c] = board[r][c], '#'
        found = dfs(r+1,c,idx+1) or dfs(r-1,c,idx+1) or dfs(r,c+1,idx+1) or dfs(r,c-1,idx+1)
        board[r][c] = temp
        return found
    
    return any(dfs(r,c,0) for r in range(rows) for c in range(cols))

*/
