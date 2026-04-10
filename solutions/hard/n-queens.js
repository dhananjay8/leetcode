/**
 * Problem: N-Queens
 * Link: https://leetcode.com/problems/n-queens/
 * Difficulty: Hard
 *
 * Place n queens on an n×n board so no two queens attack each other.
 *
 * Time Complexity: O(n!)
 * Space Complexity: O(n^2)
 */

// JavaScript Solution - Backtracking
function solveNQueens(n) {
  const result = [];
  const board = Array.from({ length: n }, () => '.'.repeat(n));
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();

  function backtrack(row) {
    if (row === n) { result.push([...board]); return; }

    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;

      // Place queen
      cols.add(col); diag1.add(row - col); diag2.add(row + col);
      board[row] = board[row].substring(0, col) + 'Q' + board[row].substring(col + 1);

      backtrack(row + 1);

      // Remove queen (backtrack)
      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
      board[row] = board[row].substring(0, col) + '.' + board[row].substring(col + 1);
    }
  }

  backtrack(0);
  return result;
}

module.exports = solveNQueens;

/* Python Solution:

def solveNQueens(n):
    result = []
    board = ['.' * n for _ in range(n)]
    cols, diag1, diag2 = set(), set(), set()
    
    def backtrack(row):
        if row == n:
            result.append(board[:])
            return
        for col in range(n):
            if col in cols or (row-col) in diag1 or (row+col) in diag2:
                continue
            cols.add(col); diag1.add(row-col); diag2.add(row+col)
            board[row] = '.'*col + 'Q' + '.'*(n-col-1)
            backtrack(row + 1)
            cols.remove(col); diag1.remove(row-col); diag2.remove(row+col)
            board[row] = '.' * n
    
    backtrack(0)
    return result

*/
