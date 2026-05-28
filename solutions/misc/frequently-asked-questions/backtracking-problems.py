"""
Backtracking — 5 Core Problems (Python)

LC 39 — Combination Sum
LC 46 — Permutations
LC 51 — N-Queens
LC 78 — Subsets
LC 79 — Word Search
"""

from typing import List


# LC 39 — Combination Sum
def combination_sum(candidates: List[int], target: int) -> List[List[int]]:
    """Find all unique combinations where candidates sum to target (can reuse candidates)."""
    res = []
    candidates.sort()  # Sort to enable early termination

    def backtrack(start, current, remaining):
        if remaining == 0:
            res.append(current[:]); return  # Found valid combination
        for i in range(start, len(candidates)):
            if candidates[i] > remaining: break  # Early termination (sorted)
            current.append(candidates[i])
            # Pass i (not i+1) to allow reuse of same candidate
            backtrack(i, current, remaining - candidates[i])
            current.pop()  # Backtrack: remove last element

    backtrack(0, [], target)
    return res


# LC 46 — Permutations
def permute(nums: List[int]) -> List[List[int]]:
    """Generate all permutations of the given array."""
    res = []

    def backtrack(current, remaining):
        if not remaining:
            res.append(current[:]); return  # All elements used
        for i in range(len(remaining)):
            current.append(remaining[i])
            # Recurse with remaining elements excluding current choice
            backtrack(current, remaining[:i] + remaining[i+1:])
            current.pop()  # Backtrack

    backtrack([], nums)
    return res


# LC 51 — N-Queens
def solve_n_queens(n: int) -> List[List[str]]:
    """Place N queens on N×N chessboard so no two queens attack each other."""
    res = []
    # Track occupied columns and diagonals for O(1) conflict detection
    cols, pos_diag, neg_diag = set(), set(), set()
    board = [["." for _ in range(n)] for _ in range(n)]

    def backtrack(row):
        if row == n:
            res.append(["".join(r) for r in board]); return  # All queens placed
        for col in range(n):
            # Check if queen at (row, col) conflicts with existing queens
            if col in cols or (row+col) in pos_diag or (row-col) in neg_diag:
                continue
            # Place queen
            board[row][col] = "Q"
            cols.add(col); pos_diag.add(row+col); neg_diag.add(row-col)
            backtrack(row + 1)
            # Backtrack: remove queen
            board[row][col] = "."
            cols.discard(col); pos_diag.discard(row+col); neg_diag.discard(row-col)

    backtrack(0)
    return res


# LC 78 — Subsets
def subsets(nums: List[int]) -> List[List[int]]:
    """Generate all possible subsets (power set) of the given array."""
    res = []

    def backtrack(start, current):
        res.append(current[:])  # Add current subset to results
        for i in range(start, len(nums)):
            current.append(nums[i])
            # Generate subsets including nums[i] and subsequent elements
            backtrack(i + 1, current)
            current.pop()  # Backtrack

    backtrack(0, [])
    return res


# LC 79 — Word Search
def exist(board: List[List[str]], word: str) -> bool:
    """Check if word exists in grid by moving to adjacent cells (no reuse)."""
    rows, cols = len(board), len(board[0])
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]  # 4-directional movement

    def backtrack(r, c, idx):
        if idx == len(word): return True  # All characters matched
        # Check bounds and character match
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[idx]:
            return False
        # Mark cell as visited
        temp = board[r][c]; board[r][c] = "#"
        # Explore all 4 directions
        for dr, dc in dirs:
            if backtrack(r+dr, c+dc, idx+1):
                board[r][c] = temp; return True
        # Backtrack: restore cell
        board[r][c] = temp
        return False

    # Try starting from each cell
    return any(backtrack(r, c, 0) for r in range(rows) for c in range(cols))


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(combination_sum([2,3,6,7], 7))   # [[2,2,3],[7]]
    print(len(permute([1,2,3])))            # 6
    print(len(solve_n_queens(4)))           # 2
    print(len(subsets([1,2,3])))            # 8
    board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]
    print(exist(board, "ABCCED"))           # True
