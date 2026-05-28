/**
 * Backtracking — 5 Core Problems
 *
 * Template:
 *   function backtrack(start, current):
 *     if goal_reached: result.push(current.slice()); return
 *     for i from start to end:
 *       choose: current.push(candidates[i])
 *       explore: backtrack(i+1, current)   // or i for reuse
 *       unchoose: current.pop()
 *
 * Problems:
 *   LC 39 — Combination Sum (Medium)
 *   LC 46 — Permutations (Medium)
 *   LC 51 — N-Queens (Hard)
 *   LC 78 — Subsets (Medium)
 *   LC 79 — Word Search (Medium)
 */

// LC 39 — Combination Sum (elements can be reused)
function combinationSum(candidates, target) {
  const res = [];
  candidates.sort((a, b) => a - b);

  function backtrack(start, current, remaining) {
    if (remaining === 0) { res.push([...current]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // pruning
      current.push(candidates[i]);
      backtrack(i, current, remaining - candidates[i]); // i, not i+1 (reuse allowed)
      current.pop();
    }
  }
  backtrack(0, [], target);
  return res;
}

// LC 46 — Permutations
function permute(nums) {
  const res = [];

  function backtrack(current, remaining) {
    if (remaining.length === 0) { res.push([...current]); return; }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      backtrack(current, [...remaining.slice(0, i), ...remaining.slice(i+1)]);
      current.pop();
    }
  }
  backtrack([], nums);
  return res;
}

// LC 51 — N-Queens
function solveNQueens(n) {
  const res = [];
  const cols = new Set(), posDiag = new Set(), negDiag = new Set();
  const board = Array.from({ length: n }, () => new Array(n).fill("."));

  function backtrack(row) {
    if (row === n) {
      res.push(board.map(r => r.join("")));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || posDiag.has(row + col) || negDiag.has(row - col)) continue;
      board[row][col] = "Q";
      cols.add(col); posDiag.add(row + col); negDiag.add(row - col);
      backtrack(row + 1);
      board[row][col] = ".";
      cols.delete(col); posDiag.delete(row + col); negDiag.delete(row - col);
    }
  }
  backtrack(0);
  return res;
}

// LC 78 — Subsets (power set)
function subsets(nums) {
  const res = [];

  function backtrack(start, current) {
    res.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return res;
}

// LC 79 — Word Search
function exist(board, word) {
  const rows = board.length, cols = board[0].length;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  function backtrack(r, c, idx) {
    if (idx === word.length) return true;
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== word[idx]) return false;

    const temp = board[r][c];
    board[r][c] = "#"; // mark visited
    for (const [dr, dc] of dirs) {
      if (backtrack(r + dr, c + dc, idx + 1)) { board[r][c] = temp; return true; }
    }
    board[r][c] = temp;
    return false;
  }

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (backtrack(r, c, 0)) return true;

  return false;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(combinationSum([2,3,6,7], 7)); // [[2,2,3],[7]]
console.log(permute([1,2,3]).length);       // 6
console.log(solveNQueens(4).length);        // 2
console.log(subsets([1,2,3]).length);       // 8
console.log(exist([["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCCED")); // true

module.exports = { combinationSum, permute, solveNQueens, subsets, exist };
