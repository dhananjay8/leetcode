/**
 * Problem: Redundant Connection
 * Link: https://leetcode.com/problems/redundant-connection/
 * Difficulty: Medium
 *
 * Find the edge that can be removed so the graph becomes a tree (no cycle).
 *
 * Time Complexity: O(n * α(n)) ≈ O(n) with Union-Find
 * Space Complexity: O(n)
 */

// JavaScript Solution - Union Find
function findRedundantConnection(edges) {
  const n = edges.length;
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const rank = new Array(n + 1).fill(0);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]); // path compression
    return parent[x];
  }

  function union(x, y) {
    const px = find(x), py = find(y);
    if (px === py) return false; // cycle detected
    if (rank[px] < rank[py]) parent[px] = py;      // union by rank
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }

  for (const [u, v] of edges) {
    if (!union(u, v)) return [u, v]; // this edge creates a cycle
  }

  return [];
}

module.exports = findRedundantConnection;

/* Python Solution:

def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))
    rank = [0] * (len(edges) + 1)
    
    def find(x):
        if parent[x] != x: parent[x] = find(parent[x])
        return parent[x]
    
    def union(x, y):
        px, py = find(x), find(y)
        if px == py: return False  # cycle
        if rank[px] < rank[py]: parent[px] = py
        elif rank[px] > rank[py]: parent[py] = px
        else: parent[py] = px; rank[px] += 1
        return True
    
    for u, v in edges:
        if not union(u, v): return [u, v]

*/
