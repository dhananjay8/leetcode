/**
 * @param {character[][]} board
 * @param {string[]} words
 * @return {string[]}
 */
var findWords = function (board, words) {
  const rows = board.length;
  const cols = board[0].length;

  // Build a Trie from the list of words
  const trie = {};
  for (let word of words) {
    let node = trie;
    for (let char of word) {
      if (!node[char]) {
        node[char] = {};
      }
      node = node[char];
    }
    node.isEnd = true; // Mark the end of a word
  }

  const result = new Set();
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  const dfs = (row, col, node, path) => {
    if (node.isEnd) {
      result.add(path);
    }

    // Out of bounds or already visited
    if (
      row < 0 ||
      col < 0 ||
      row >= rows ||
      col >= cols ||
      visited[row][col] ||
      !node[board[row][col]]
    ) {
      return;
    }

    // Explore
    visited[row][col] = true;
    const char = board[row][col];
    for (const [dr, dc] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      dfs(row + dr, col + dc, node[char], path + char);
    }
    visited[row][col] = false;
  };

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (trie[board[i][j]]) {
        dfs(i, j, trie, "");
      }
    }
  }

  return Array.from(result);
};
