var Trie = function () {
  this.children = {};
};

/**
 * @param {string} word
 * @return {void}
 */
Trie.prototype.insert = function (word) {
  let node = this.children;
  // console.log('node--1', node, word);
  for (let char of word) {
    if (!node[char]) {
      node[char] = {};
    }
    node = node[char];
  }
  // console.log('node--2', node);
  node.isEnd = true;
};

/**
 * @param {string} word
 * @return {boolean}
 */
Trie.prototype.search = function (word) {
  let node = this.children;
  // console.log('node--search', node, word);
  for (let char of word) {
    if (!node[char]) {
      return false;
    }
    node = node[char];
  }
  return node.isEnd === true;
};

/**
 * @param {string} prefix
 * @return {boolean}
 */
Trie.prototype.startsWith = function (prefix) {
  let node = this.children;
  for (let char of prefix) {
    if (!node[char]) {
      return false;
    }
    node = node[char];
  }
  return true;
};

/**
 * Your Trie object will be instantiated and called as such:
 * var obj = new Trie()
 * obj.insert(word)
 * var param_2 = obj.search(word)
 * var param_3 = obj.startsWith(prefix)
 */
