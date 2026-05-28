"""
BFS — 7 Core Problems (Python)

LC 102 — Binary Tree Level Order Traversal
LC 200 — Number of Islands
LC 994 — Rotting Oranges
LC 542 — 01 Matrix
LC 127 — Word Ladder (see word-ladder.py)
LC 286 — Walls and Gates
LC 815 — Bus Routes
"""

from collections import deque, defaultdict
from typing import List, Optional


# ── TreeNode helper ───────────────────────────────────────────────────────────
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right


# LC 102 — Level Order Traversal
def level_order(root: Optional[TreeNode]) -> List[List[int]]:
    """BFS level order traversal of binary tree."""
    if not root: return []
    res, queue = [], deque([root])
    while queue:
        level = []
        # Process all nodes at current level (queue size = level size)
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        res.append(level)
    return res


# LC 200 — Number of Islands
def num_islands(grid: List[List[str]]) -> int:
    """Count connected components of '1's in 2D grid using BFS."""
    rows, cols = len(grid), len(grid[0])
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]  # 4-directional movement
    count = 0

    def bfs(r, c):
        """Mark all connected land cells as visited (change to '0')."""
        queue = deque([(r, c)])
        grid[r][c] = "0"  # Mark as visited
        while queue:
            row, col = queue.popleft()
            for dr, dc in dirs:
                nr, nc = row+dr, col+dc
                # If neighbor is valid land cell, add to queue and mark visited
                if 0<=nr<rows and 0<=nc<cols and grid[nr][nc]=="1":
                    queue.append((nr, nc)); grid[nr][nc]="0"

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1": count += 1; bfs(r, c)
    return count


# LC 994 — Rotting Oranges
def oranges_rotting(grid: List[List[int]]) -> int:
    """Calculate minimum minutes for all oranges to rot using multi-source BFS."""
    rows, cols = len(grid), len(grid[0])
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]
    queue, fresh = deque(), 0
    # Initialize queue with all rotten oranges (2) and count fresh oranges (1)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2: queue.append((r, c, 0))  # (row, col, time)
            elif grid[r][c] == 1: fresh += 1
    max_time = 0
    # BFS from all rotten oranges simultaneously
    while queue:
        r, c, t = queue.popleft()
        for dr, dc in dirs:
            nr, nc = r+dr, c+dc
            # If neighbor is fresh orange, rot it and add to queue
            if 0<=nr<rows and 0<=nc<cols and grid[nr][nc]==1:
                grid[nr][nc]=2; fresh-=1; max_time=max(max_time,t+1); queue.append((nr,nc,t+1))
    return max_time if fresh==0 else -1  # -1 if some oranges never rot


# LC 542 — 01 Matrix
def update_matrix(mat: List[List[int]]) -> List[List[int]]:
    """Compute distance to nearest 0 for each cell using multi-source BFS."""
    rows, cols = len(mat), len(mat[0])
    dist = [[float("inf")]*cols for _ in range(rows)]
    queue = deque()
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]
    # Initialize queue with all 0 cells (distance 0)
    for r in range(rows):
        for c in range(cols):
            if mat[r][c]==0: dist[r][c]=0; queue.append((r,c))
    # BFS to propagate distances
    while queue:
        r, c = queue.popleft()
        for dr, dc in dirs:
            nr, nc = r+dr, c+dc
            # If neighbor can be reached with shorter distance, update and add to queue
            if 0<=nr<rows and 0<=nc<cols and dist[nr][nc]>dist[r][c]+1:
                dist[nr][nc]=dist[r][c]+1; queue.append((nr,nc))
    return dist


# LC 815 — Bus Routes
def num_buses_to_destination(routes: List[List[int]], source: int, target: int) -> int:
    """Find minimum number of buses to reach target from source using BFS on route graph."""
    if source == target: return 0
    # Build map: stop -> set of route indices that include this stop
    stop_to_routes: defaultdict = defaultdict(set)
    for i, route in enumerate(routes):
        for stop in route: stop_to_routes[stop].add(i)

    visited_stops = {source}
    visited_routes: set = set()
    queue = deque([(source, 0)])  # (stop, number_of_buses_taken)

    while queue:
        stop, buses = queue.popleft()
        # For each route that passes through current stop
        for route_idx in stop_to_routes[stop]:
            if route_idx in visited_routes: continue
            visited_routes.add(route_idx)
            # Explore all stops on this route
            for next_stop in routes[route_idx]:
                if next_stop == target: return buses + 1
                if next_stop not in visited_stops:
                    visited_stops.add(next_stop); queue.append((next_stop, buses+1))
    return -1


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    grid = [["1","1","1"],["0","1","0"],["1","1","1"]]
    print("Islands:", num_islands(grid))  # 1

    rotten = [[2,1,1],[1,1,0],[0,1,1]]
    print("Rotting:", oranges_rotting(rotten))  # 4

    print("Bus routes:", num_buses_to_destination([[1,2,7],[3,6,7]], 1, 6))  # 2
