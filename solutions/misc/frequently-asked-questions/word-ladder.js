/**
 * Word Ladder (LC 127) — Hard
 * Pattern: BFS on implicit graph (word → neighbors by 1-char change)
 *
 * Time:  O(M² × N) where M = word length, N = wordList size
 * Space: O(M² × N) for adjacency preprocessing
 *
 * 60-Second ID:
 *   Core DS: word → graph node; queue for BFS
 *   Core Op: shortest path (BFS guarantees this)
 *   Constraint: single character changes define edges
 *   → BFS on word graph; wildcard pattern preprocessing speeds it up
 */

/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @returns {number} length of shortest transformation sequence, or 0
 */
function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  // Preprocessing: map pattern → list of words matching it
  // e.g., "h*t" → ["hot","hit"]
  const patternMap = new Map();
  const allWords = [beginWord, ...wordList];
  for (const word of allWords) {
    for (let i = 0; i < word.length; i++) {
      const pattern = word.slice(0, i) + "*" + word.slice(i + 1);
      if (!patternMap.has(pattern)) patternMap.set(pattern, []);
      patternMap.get(pattern).push(word);
    }
  }

  const queue = [[beginWord, 1]]; // [word, steps]
  const visited = new Set([beginWord]);

  while (queue.length > 0) {
    const [word, steps] = queue.shift();

    for (let i = 0; i < word.length; i++) {
      const pattern = word.slice(0, i) + "*" + word.slice(i + 1);
      for (const neighbor of (patternMap.get(pattern) || [])) {
        if (neighbor === endWord) return steps + 1;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([neighbor, steps + 1]);
        }
      }
    }
  }
  return 0;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(ladderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"])); // 5
console.log(ladderLength("hit", "cog", ["hot","dot","dog","lot","log"]));       // 0

module.exports = { ladderLength };
