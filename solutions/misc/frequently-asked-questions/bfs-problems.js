/**
 * BFS — 7 Core Problems
 *
 * Template:
 *   queue = [start]; visited = new Set([start])
 *   while queue:
 *     node = queue.shift()
 *     for neighbor of graph[node]:
 *       if not visited: visited.add; queue.push
 *
 * Problems:
 *   LC 102 — Binary Tree Level Order Traversal (Medium)
 *   LC 200 — Number of Islands (Medium)
 *   LC 994 — Rotting Oranges (Medium)
 *   LC 542 — 01 Matrix (Medium)
 *   LC 127 — Word Ladder (Hard) — see word-ladder.js
 *   LC 286 — Walls and Gates (Medium)
 *   LC 815 — Bus Routes (Hard)
 */

// ═══════════════════════════════════════════════════════
// LC 102 — Binary Tree Level Order Traversal
// ═══════════════════════════════════════════════════════
function levelOrder(root) {
  if (!root) return [];
  const res = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(level);
  }
  return res;
}

// ═══════════════════════════════════════════════════════
// LC 200 — Number of Islands
// ═══════════════════════════════════════════════════════
function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let count = 0;

  function bfs(r, c) {
    const queue = [[r, c]];
    grid[r][c] = "0";
    while (queue.length) {
      const [row, col] = queue.shift();
      for (const [dr, dc] of dirs) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
          queue.push([nr, nc]);
          grid[nr][nc] = "0";
        }
      }
    }
  }

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === "1") { count++; bfs(r, c); }

  return count;
}

// ═══════════════════════════════════════════════════════
// LC 994 — Rotting Oranges
// ═══════════════════════════════════════════════════════
function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  const queue = [];
  let fresh = 0;

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c, 0]);
      if (grid[r][c] === 1) fresh++;
    }

  let maxTime = 0;
  while (queue.length) {
    const [r, c, time] = queue.shift();
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
        grid[nr][nc] = 2;
        fresh--;
        maxTime = Math.max(maxTime, time + 1);
        queue.push([nr, nc, time + 1]);
      }
    }
  }
  return fresh === 0 ? maxTime : -1;
}

// ═══════════════════════════════════════════════════════
// LC 542 — 01 Matrix (distance to nearest 0)
// ═══════════════════════════════════════════════════════
function updateMatrix(mat) {
  const rows = mat.length, cols = mat[0].length;
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  const queue = [];
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (mat[r][c] === 0) { dist[r][c] = 0; queue.push([r, c]); }

  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && dist[nr][nc] > dist[r][c] + 1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return dist;
}

// ═══════════════════════════════════════════════════════
// LC 815 — Bus Routes (minimum number of buses to reach target)
// ═══════════════════════════════════════════════════════
function numBusesToDestination(routes, source, target) {
  if (source === target) return 0;

  // Build stop → list of route indices
  const stopToRoutes = new Map();
  for (let i = 0; i < routes.length; i++)
    for (const stop of routes[i]) {
      if (!stopToRoutes.has(stop)) stopToRoutes.set(stop, []);
      stopToRoutes.get(stop).push(i);
    }

  const visitedStops  = new Set([source]);
  const visitedRoutes = new Set();
  const queue = [[source, 0]]; // [stop, buses_taken]

  while (queue.length) {
    const [stop, buses] = queue.shift();
    for (const routeIdx of (stopToRoutes.get(stop) || [])) {
      if (visitedRoutes.has(routeIdx)) continue;
      visitedRoutes.add(routeIdx);
      for (const nextStop of routes[routeIdx]) {
        if (nextStop === target) return buses + 1;
        if (!visitedStops.has(nextStop)) {
          visitedStops.add(nextStop);
          queue.push([nextStop, buses + 1]);
        }
      }
    }
  }
  return -1;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
const grid1 = [["1","1","1"],["0","1","0"],["1","1","1"]];
console.log("Islands:", numIslands(grid1)); // 1

const rotten = [[2,1,1],[1,1,0],[0,1,1]];
console.log("Rotting:", orangesRotting(rotten)); // 4

console.log("Bus routes:", numBusesToDestination([[1,2,7],[3,6,7]], 1, 6)); // 2

module.exports = { levelOrder, numIslands, orangesRotting, updateMatrix, numBusesToDestination };
