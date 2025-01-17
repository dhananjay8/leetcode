var WordDictionary = function () {
  this.trie = {};
};

/**
 * @param {string} word
 * @return {void}
 */
WordDictionary.prototype.addWord = function (word) {
  let node = this.trie;
  for (const char of word) {
    if (!node[char]) {
      node[char] = {};
    }
    node = node[char];
  }
  node.isEnd = true; // Mark the end of the word
};

/**
 * @param {string} word
 * @return {boolean}
 */
WordDictionary.prototype.search = function (word) {
  const dfs = (node, index) => {
    if (index === word.length) {
      return node.isEnd === true;
    }

    const char = word[index];

    if (char === ".") {
      // Match any letter
      for (const key in node) {
        if (key !== "isEnd" && dfs(node[key], index + 1)) {
          return true;
        }
      }
      return false;
    } else {
      // Match specific letter
      if (!node[char]) {
        return false;
      }
      return dfs(node[char], index + 1);
    }
  };

  return dfs(this.trie, 0);
};

/**
 * Your WordDictionary object will be instantiated and called as such:
 * var obj = new WordDictionary()
 * obj.addWord(word)
 * var param_2 = obj.search(word)
 */
