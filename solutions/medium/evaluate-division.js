/**
 * Problem: Evaluate Division
 * Link: https://leetcode.com/problems/evaluate-division/
 * Difficulty: Medium
 *
 * Given equations like a/b=2.0, b/c=3.0, answer queries like a/c=?
 * Model as weighted directed graph and do DFS/BFS.
 *
 * Time Complexity: O(Q * (V + E)) where Q is number of queries
 * Space Complexity: O(V + E)
 */

// JavaScript Solution - Graph DFS
function calcEquation(equations, values, queries) {
  // Build weighted graph: a/b = val means a->b with weight val, b->a with weight 1/val
  const graph = new Map();

  for (let i = 0; i < equations.length; i++) {
    const [a, b] = equations[i];
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push([b, values[i]]);
    graph.get(b).push([a, 1 / values[i]]);
  }

  // DFS to find path from src to target, multiplying weights
  function dfs(src, target, visited) {
    if (!graph.has(src) || !graph.has(target)) return -1.0;
    if (src === target) return 1.0;

    visited.add(src);

    for (const [neighbor, weight] of graph.get(src)) {
      if (!visited.has(neighbor)) {
        const result = dfs(neighbor, target, visited);
        if (result !== -1.0) return weight * result;
      }
    }

    return -1.0;
  }

  return queries.map(([a, b]) => dfs(a, b, new Set()));
}

module.exports = calcEquation;

/* Python Solution:

from collections import defaultdict

def calcEquation(equations, values, queries):
    graph = defaultdict(list)
    
    for (a, b), val in zip(equations, values):
        graph[a].append((b, val))
        graph[b].append((a, 1 / val))
    
    def dfs(src, target, visited):
        if src not in graph or target not in graph:
            return -1.0
        if src == target:
            return 1.0
        
        visited.add(src)
        for neighbor, weight in graph[src]:
            if neighbor not in visited:
                result = dfs(neighbor, target, visited)
                if result != -1.0:
                    return weight * result
        return -1.0
    
    return [dfs(a, b, set()) for a, b in queries]

*/
