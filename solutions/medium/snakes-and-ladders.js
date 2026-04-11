/**
 * Problem: Snakes and Ladders
 * Link: https://leetcode.com/problems/snakes-and-ladders/
 * Difficulty: Medium
 *
 * Find minimum dice rolls to reach the last square. BFS on the board.
 *
 * Time Complexity: O(n²)
 * Space Complexity: O(n²)
 */

// JavaScript Solution — BFS
function snakesAndLadders(board) {
  const n = board.length;
  const target = n * n;

  // Convert board position (1-indexed) to row,col
  function getRowCol(pos) {
    const r = Math.floor((pos - 1) / n);
    const c = (pos - 1) % n;
    const row = n - 1 - r; // board is bottom-to-top
    const col = r % 2 === 0 ? c : n - 1 - c; // alternating direction
    return [row, col];
  }

  const visited = new Set([1]);
  const queue = [[1, 0]]; // [position, rolls]

  while (queue.length) {
    const [pos, rolls] = queue.shift();
    for (let dice = 1; dice <= 6; dice++) {
      let next = pos + dice;
      if (next > target) continue;
      const [r, c] = getRowCol(next);
      if (board[r][c] !== -1) next = board[r][c]; // snake or ladder
      if (next === target) return rolls + 1;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, rolls + 1]);
      }
    }
  }

  return -1;
}

module.exports = snakesAndLadders;

/* Python Solution:

from collections import deque

def snakesAndLadders(board):
    n = len(board)
    target = n * n
    
    def get_rc(pos):
        r, c = divmod(pos - 1, n)
        row = n - 1 - r
        col = c if r % 2 == 0 else n - 1 - c
        return row, col
    
    visited = {1}
    queue = deque([(1, 0)])
    
    while queue:
        pos, rolls = queue.popleft()
        for dice in range(1, 7):
            nxt = pos + dice
            if nxt > target: continue
            r, c = get_rc(nxt)
            if board[r][c] != -1: nxt = board[r][c]
            if nxt == target: return rolls + 1
            if nxt not in visited:
                visited.add(nxt)
                queue.append((nxt, rolls + 1))
    return -1

*/
