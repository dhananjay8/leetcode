/**
 * Problem: Game of Life
 * Link: https://leetcode.com/problems/game-of-life/
 * Difficulty: Medium
 * 
 * The board is made up of an m x n grid of cells, where each cell has an initial state: 
 * live (1) or dead (0). Each cell interacts with its eight neighbors using the following rules:
 * 1. Any live cell with fewer than two live neighbors dies (under-population).
 * 2. Any live cell with two or three live neighbors lives on to the next generation.
 * 3. Any live cell with more than three live neighbors dies (over-population).
 * 4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction).
 * 
 * Update the board in-place to represent the next state.
 * 
 * Time Complexity: O(m * n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - In-place with state encoding
function gameOfLife(board) {
    if (!board || board.length === 0) return;
    
    const m = board.length;
    const n = board[0].length;
    
    // Directions for 8 neighbors: up, down, left, right, and 4 diagonals
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    // Count live neighbors for a cell
    function countLiveNeighbors(row, col) {
        let count = 0;
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            // Check bounds and count live cells (1 or 2 means currently/previously alive)
            if (newRow >= 0 && newRow < m && newCol >= 0 && newCol < n) {
                if (board[newRow][newCol] === 1 || board[newRow][newCol] === 2) {
                    count++;
                }
            }
        }
        return count;
    }
    
    // First pass: mark cells with intermediate states
    // 0: dead -> dead
    // 1: live -> live
    // 2: live -> dead
    // 3: dead -> live
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const liveNeighbors = countLiveNeighbors(i, j);
            
            if (board[i][j] === 1) {
                // Live cell
                if (liveNeighbors < 2 || liveNeighbors > 3) {
                    board[i][j] = 2; // Will die
                }
            } else {
                // Dead cell
                if (liveNeighbors === 3) {
                    board[i][j] = 3; // Will become alive
                }
            }
        }
    }
    
    // Second pass: update to final states
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (board[i][j] === 2) {
                board[i][j] = 0; // Dies
            } else if (board[i][j] === 3) {
                board[i][j] = 1; // Becomes alive
            }
        }
    }
}

// Alternative solution with extra space O(m*n)
function gameOfLifeWithCopy(board) {
    if (!board || board.length === 0) return;
    
    const m = board.length;
    const n = board[0].length;
    
    // Create a copy of the board
    const copy = board.map(row => [...row]);
    
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    function countLiveNeighbors(row, col) {
        let count = 0;
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (newRow >= 0 && newRow < m && newCol >= 0 && newCol < n) {
                if (copy[newRow][newCol] === 1) {
                    count++;
                }
            }
        }
        return count;
    }
    
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const liveNeighbors = countLiveNeighbors(i, j);
            
            if (copy[i][j] === 1) {
                // Live cell
                board[i][j] = (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
            } else {
                // Dead cell
                board[i][j] = (liveNeighbors === 3) ? 1 : 0;
            }
        }
    }
}

// Test case
const board = [
    [0,1,0],
    [0,0,1],
    [1,1,1],
    [0,0,0]
];
gameOfLife(board);
console.log(board);
// Output: [[0,0,0],[1,0,1],[0,1,1],[0,1,0]]

module.exports = gameOfLife;

/* Python Solution (commented):

def game_of_life(board: list[list[int]]) -> None:
    """
    Update the board in-place to represent the next state of Conway's Game of Life.
    
    Args:
        board: m x n grid representing the current state
    
    Time Complexity: O(m * n)
    Space Complexity: O(1)
    """
    if not board:
        return
    
    m, n = len(board), len(board[0])
    
    # Directions for 8 neighbors
    directions = [
        (-1, -1), (-1, 0), (-1, 1),
        (0, -1),           (0, 1),
        (1, -1),  (1, 0),  (1, 1)
    ]
    
    def count_live_neighbors(row: int, col: int) -> int:
        """Count live neighbors for a cell"""
        count = 0
        for dx, dy in directions:
            new_row, new_col = row + dx, col + dy
            
            # Check bounds and count live cells
            if 0 <= new_row < m and 0 <= new_col < n:
                if board[new_row][new_col] in [1, 2]:
                    count += 1
        return count
    
    # First pass: mark cells with intermediate states
    # 0: dead -> dead
    # 1: live -> live
    # 2: live -> dead
    # 3: dead -> live
    for i in range(m):
        for j in range(n):
            live_neighbors = count_live_neighbors(i, j)
            
            if board[i][j] == 1:
                # Live cell
                if live_neighbors < 2 or live_neighbors > 3:
                    board[i][j] = 2  # Will die
            else:
                # Dead cell
                if live_neighbors == 3:
                    board[i][j] = 3  # Will become alive
    
    # Second pass: update to final states
    for i in range(m):
        for j in range(n):
            if board[i][j] == 2:
                board[i][j] = 0  # Dies
            elif board[i][j] == 3:
                board[i][j] = 1  # Becomes alive

# Test case
board = [
    [0,1,0],
    [0,0,1],
    [1,1,1],
    [0,0,0]
]
game_of_life(board)
print(board)
# Output: [[0,0,0],[1,0,1],[0,1,1],[0,1,0]]

*/
