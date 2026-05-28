"""
Detect Cycle in a Directed Graph
Pattern: DFS with 3-color marking OR Kahn's BFS (topological sort)

Time:  O(V + E)
Space: O(V)
"""

from collections import defaultdict, deque
from typing import List


def has_cycle_dfs(n: int, edges: List[List[int]]) -> bool:
    """DFS 3-color: WHITE=unvisited, GRAY=in-stack, BLACK=done."""
    # Build adjacency list for the directed graph
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)

    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n  # Track visitation state of each node

    def dfs(node: int) -> bool:
        """Returns True if a cycle is found in the DFS subtree rooted at node."""
        color[node] = GRAY  # Mark node as being in current recursion stack
        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                # Back edge found: neighbor is already in current path → cycle
                return True
            if color[neighbor] == WHITE and dfs(neighbor):
                # If neighbor's DFS finds a cycle, propagate it up
                return True
        color[node] = BLACK  # Mark node as fully processed (no cycle in its subtree)
        return False

    # Run DFS from each unvisited node (handles disconnected graphs)
    return any(color[i] == WHITE and dfs(i) for i in range(n))


def has_cycle_bfs(n: int, edges: List[List[int]]) -> bool:
    """Kahn's BFS: cycle ↔ not all nodes can be topologically ordered."""
    # Build adjacency list and compute in-degrees
    graph = defaultdict(list)
    in_degree = [0] * n

    for u, v in edges:
        graph[u].append(v)
        in_degree[v] += 1

    # Initialize queue with all nodes having in-degree 0 (no dependencies)
    queue = deque(i for i in range(n) if in_degree[i] == 0)
    processed = 0

    # Process nodes in topological order
    while queue:
        node = queue.popleft()
        processed += 1
        # Remove outgoing edges from node, decrement neighbors' in-degrees
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            # If neighbor's in-degree becomes 0, all its dependencies are processed
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # If not all nodes processed, there's a cycle (nodes with remaining in-degrees)
    return processed != n


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("DFS cycle:",    has_cycle_dfs(4, [[0,1],[1,2],[2,3],[3,1]]))  # True
    print("DFS no cycle:", has_cycle_dfs(4, [[0,1],[1,2],[2,3]]))        # False
    print("BFS cycle:",    has_cycle_bfs(4, [[0,1],[1,2],[2,3],[3,1]]))  # True
    print("BFS no cycle:", has_cycle_bfs(4, [[0,1],[1,2],[2,3]]))        # False
