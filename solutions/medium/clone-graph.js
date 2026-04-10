/**
 * Problem: Clone Graph
 * Link: https://leetcode.com/problems/clone-graph/
 * Difficulty: Medium
 *
 * Return a deep copy of a connected undirected graph.
 *
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */

function Node(val, neighbors) {
  this.val = val === undefined ? 0 : val;
  this.neighbors = neighbors === undefined ? [] : neighbors;
}

// JavaScript Solution - DFS with HashMap
function cloneGraph(node) {
  if (!node) return null;

  const visited = new Map(); // original node -> cloned node

  function dfs(original) {
    if (visited.has(original)) return visited.get(original);

    const clone = new Node(original.val); // create clone
    visited.set(original, clone); // mark visited before recursing (handles cycles)

    // Clone all neighbors
    for (const neighbor of original.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }

    return clone;
  }

  return dfs(node);
}

module.exports = cloneGraph;

/* Python Solution:

class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors else []

def cloneGraph(node):
    if not node:
        return None
    
    visited = {}  # original -> clone
    
    def dfs(original):
        if original in visited:
            return visited[original]
        
        clone = Node(original.val)
        visited[original] = clone  # mark before recursing
        
        for neighbor in original.neighbors:
            clone.neighbors.append(dfs(neighbor))
        
        return clone
    
    return dfs(node)

*/
