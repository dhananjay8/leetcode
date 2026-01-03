/**
 * Problem: Valid Sudoku
 * Link: https://leetcode.com/problems/valid-sudoku/
 * Difficulty: Medium
 *
 * Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated
 * according to the following rules:
 * 1. Each row must contain digits 1-9 without repetition
 * 2. Each column must contain digits 1-9 without repetition
 * 3. Each of the nine 3x3 sub-boxes must contain digits 1-9 without repetition
 *
 * Example:
 * Input: board =
 * [["5","3",".",".","7",".",".",".","."]
 * ,["6",".",".","1","9","5",".",".","."]
 * ,[".","9","8",".",".",".",".","6","."]
 * ,["8",".",".",".","6",".",".",".","3"]
 * ,["4",".",".","8",".","3",".",".","1"]
 * ,["7",".",".",".","2",".",".",".","6"]
 * ,[".","6",".",".",".",".","2","8","."]
 * ,[".",".",".","4","1","9",".",".","5"]
 * ,[".",".",".",".","8",".",".","7","9"]]
 * Output: true
 *
 * Time Complexity: O(1) - fixed 9x9 board
 * Space Complexity: O(1)
 */

// JavaScript Solution - Hash Sets
function isValidSudoku(board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const num = board[i][j];

      if (num === ".") continue;

      // Check row
      if (rows[i].has(num)) return false;
      rows[i].add(num);

      // Check column
      if (cols[j].has(num)) return false;
      cols[j].add(num);

      // Check 3x3 box
      const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
      if (boxes[boxIndex].has(num)) return false;
      boxes[boxIndex].add(num);
    }
  }

  return true;
}

// Alternative: Single set with encoding
function isValidSudokuEncoded(board) {
  const seen = new Set();

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const num = board[i][j];

      if (num === ".") continue;

      const rowKey = `row${i}-${num}`;
      const colKey = `col${j}-${num}`;
      const boxKey = `box${Math.floor(i / 3)}-${Math.floor(j / 3)}-${num}`;

      if (seen.has(rowKey) || seen.has(colKey) || seen.has(boxKey)) {
        return false;
      }

      seen.add(rowKey);
      seen.add(colKey);
      seen.add(boxKey);
    }
  }

  return true;
}

// Test case
const board = [
  ["5", "3", ".", ".", "7", ".", ".", ".", "."],
  ["6", ".", ".", "1", "9", "5", ".", ".", "."],
  [".", "9", "8", ".", ".", ".", ".", "6", "."],
  ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
  ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
  ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
  [".", "6", ".", ".", ".", ".", "2", "8", "."],
  [".", ".", ".", "4", "1", "9", ".", ".", "5"],
  [".", ".", ".", ".", "8", ".", ".", "7", "9"],
];
console.log(isValidSudoku(board)); // true

module.exports = isValidSudoku;

/* Python Solution (commented):

def is_valid_sudoku(board: list[list[str]]) -> bool:
    """
    Validate Sudoku board
    
    Args:
        board: 9x9 Sudoku board
    
    Returns:
        True if valid, False otherwise
    
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    
    for i in range(9):
        for j in range(9):
            num = board[i][j]
            
            if num == '.':
                continue
            
            # Check row
            if num in rows[i]:
                return False
            rows[i].add(num)
            
            # Check column
            if num in cols[j]:
                return False
            cols[j].add(num)
            
            # Check box
            box_index = (i // 3) * 3 + (j // 3)
            if num in boxes[box_index]:
                return False
            boxes[box_index].add(num)
    
    return True

# Alternative: Single set with encoding
def is_valid_sudoku_encoded(board: list[list[str]]) -> bool:
    seen = set()
    
    for i in range(9):
        for j in range(9):
            num = board[i][j]
            
            if num == '.':
                continue
            
            row_key = f'row{i}-{num}'
            col_key = f'col{j}-{num}'
            box_key = f'box{i//3}-{j//3}-{num}'
            
            if row_key in seen or col_key in seen or box_key in seen:
                return False
            
            seen.add(row_key)
            seen.add(col_key)
            seen.add(box_key)
    
    return True

# Test case
board = [
    ["5","3",".",".","7",".",".",".","."],
    ["6",".",".","1","9","5",".",".","."],
    [".","9","8",".",".",".",".","6","."],
    ["8",".",".",".","6",".",".",".","3"],
    ["4",".",".","8",".","3",".",".","1"],
    ["7",".",".",".","2",".",".",".","6"],
    [".","6",".",".",".",".","2","8","."],
    [".",".",".","4","1","9",".",".","5"],
    [".",".",".",".","8",".",".","7","9"]
]
print(is_valid_sudoku(board))  # True

*/
