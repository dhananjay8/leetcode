/**
 * Problem: Sudoku Solver
 * Link: https://leetcode.com/problems/sudoku-solver/
 * Difficulty: Hard
 *
 * Fill empty cells ('.') to solve the Sudoku puzzle.
 *
 * Time Complexity: O(9^(empty cells))
 * Space Complexity: O(81) for the board
 */

// JavaScript Solution - Backtracking
function solveSudoku(board) {
  solve(board);
}

function solve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== '.') continue;

      for (let num = 1; num <= 9; num++) {
        const ch = String(num);
        if (isValid(board, r, c, ch)) {
          board[r][c] = ch;
          if (solve(board)) return true; // solved
          board[r][c] = '.'; // backtrack
        }
      }
      return false; // no valid number found
    }
  }
  return true; // all cells filled
}

function isValid(board, row, col, ch) {
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[row][i] === ch) return false;    // check row
    if (board[i][col] === ch) return false;    // check column
    if (board[boxRow + Math.floor(i/3)][boxCol + i%3] === ch) return false; // check box
  }
  return true;
}

module.exports = solveSudoku;

/* Python Solution:

def solveSudoku(board):
    def is_valid(r, c, ch):
        br, bc = 3*(r//3), 3*(c//3)
        for i in range(9):
            if board[r][i] == ch: return False
            if board[i][c] == ch: return False
            if board[br + i//3][bc + i%3] == ch: return False
        return True
    
    def solve():
        for r in range(9):
            for c in range(9):
                if board[r][c] != '.': continue
                for num in '123456789':
                    if is_valid(r, c, num):
                        board[r][c] = num
                        if solve(): return True
                        board[r][c] = '.'
                return False
        return True
    
    solve()

*/
