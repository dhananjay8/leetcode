/**
 * Detect Cycle in a Directed Graph
 * Pattern: DFS with 3-color marking (WHITE=0, GRAY=1, BLACK=2)
 *
 * Time:  O(V + E)
 * Space: O(V) for color array + recursion stack
 *
 * 60-Second ID:
 *   Core DS: directed graph → adjacency list
 *   Core Op: detect cycle (a back-edge = cycle)
 *   Constraint: directed (can't use simple visited set — needs in-stack tracking)
 *   → DFS with GRAY (in-stack) coloring; GRAY→GRAY edge = cycle
 *
 * Also: Topological sort via Kahn's BFS — if nodes with 0 in-degree
 * don't cover all nodes → cycle exists (alternate approach).
 */

/**
 * DFS 3-color approach
 * @param {number} n - number of nodes (0..n-1)
 * @param {number[][]} edges - [from, to] pairs
 * @returns {boolean} true if cycle exists
 */
function hasCycleDFS(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) graph[u].push(v);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(n).fill(WHITE);

  function dfs(node) {
    color[node] = GRAY; // mark as in-stack
    for (const neighbor of graph[node]) {
      if (color[neighbor] === GRAY) return true;  // back edge = cycle
      if (color[neighbor] === WHITE && dfs(neighbor)) return true;
    }
    color[node] = BLACK; // fully processed
    return false;
  }

  for (let i = 0; i < n; i++) {
    if (color[i] === WHITE && dfs(i)) return true;
  }
  return false;
}

/**
 * Kahn's BFS topological sort approach (cycle = not all nodes processed)
 * @param {number} n
 * @param {number[][]} edges
 * @returns {boolean}
 */
function hasCycleBFS(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  const inDegree = new Array(n).fill(0);

  for (const [u, v] of edges) {
    graph[u].push(v);
    inDegree[v]++;
  }

  const queue = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let processed = 0;
  while (queue.length > 0) {
    const node = queue.shift();
    processed++;
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return processed !== n; // if not all processed → cycle
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log("DFS cycle:", hasCycleDFS(4, [[0,1],[1,2],[2,3],[3,1]])); // true  (3→1 is back edge)
console.log("DFS no cycle:", hasCycleDFS(4, [[0,1],[1,2],[2,3]]));   // false
console.log("BFS cycle:", hasCycleBFS(4, [[0,1],[1,2],[2,3],[3,1]])); // true
console.log("BFS no cycle:", hasCycleBFS(4, [[0,1],[1,2],[2,3]]));   // false

module.exports = { hasCycleDFS, hasCycleBFS };
