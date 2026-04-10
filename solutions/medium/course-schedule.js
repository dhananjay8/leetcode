/**
 * Problem: Course Schedule
 * Link: https://leetcode.com/problems/course-schedule/
 * Difficulty: Medium
 *
 * Determine if you can finish all courses given prerequisites (detect cycle in directed graph).
 *
 * Example: numCourses = 2, prerequisites = [[1,0]] => true
 *
 * Time Complexity: O(V + E)
 * Space Complexity: O(V + E)
 */

// JavaScript Solution - DFS Cycle Detection
function canFinish(numCourses, prerequisites) {
  // Build adjacency list
  const graph = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
  }

  // 0 = unvisited, 1 = visiting (in current path), 2 = visited (done)
  const state = new Array(numCourses).fill(0);

  function hasCycle(node) {
    if (state[node] === 1) return true;  // cycle detected
    if (state[node] === 2) return false; // already processed

    state[node] = 1; // mark as visiting

    for (const neighbor of graph[node]) {
      if (hasCycle(neighbor)) return true;
    }

    state[node] = 2; // mark as done
    return false;
  }

  // Check every course for cycles
  for (let i = 0; i < numCourses; i++) {
    if (hasCycle(i)) return false;
  }

  return true;
}

module.exports = canFinish;

/* Python Solution:

def canFinish(numCourses, prerequisites):
    graph = [[] for _ in range(numCourses)]
    for course, prereq in prerequisites:
        graph[prereq].append(course)
    
    # 0=unvisited, 1=visiting, 2=visited
    state = [0] * numCourses
    
    def has_cycle(node):
        if state[node] == 1: return True   # cycle
        if state[node] == 2: return False   # done
        
        state[node] = 1
        for neighbor in graph[node]:
            if has_cycle(neighbor): return True
        state[node] = 2
        return False
    
    return not any(has_cycle(i) for i in range(numCourses))

*/
