/**
 * Problem: Network Delay Time
 * Link: https://leetcode.com/problems/network-delay-time/
 * Difficulty: Medium
 *
 * Find time for all nodes to receive signal from source k. Return -1 if impossible.
 * Classic Dijkstra's shortest path.
 *
 * Time Complexity: O(E log V)
 * Space Complexity: O(V + E)
 */

// JavaScript Solution - Dijkstra's Algorithm
function networkDelayTime(times, n, k) {
  // Build adjacency list
  const graph = new Map();
  for (const [u, v, w] of times) {
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push([v, w]);
  }

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;

  // Simple priority queue using sorted array (use min-heap for optimal)
  const pq = [[0, k]]; // [distance, node]

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]); // sort by distance
    const [d, u] = pq.shift();

    if (d > dist[u]) continue; // skip outdated entries

    for (const [v, w] of (graph.get(u) || [])) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }

  const maxDist = Math.max(...dist.slice(1));
  return maxDist === Infinity ? -1 : maxDist;
}

module.exports = networkDelayTime;

/* Python Solution:

import heapq
from collections import defaultdict

def networkDelayTime(times, n, k):
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))
    
    dist = {i: float('inf') for i in range(1, n+1)}
    dist[k] = 0
    pq = [(0, k)]
    
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    
    max_dist = max(dist.values())
    return max_dist if max_dist < float('inf') else -1

*/
