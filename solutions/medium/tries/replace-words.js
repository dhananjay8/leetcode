/**
 * @param {string[]} dictionary
 * @param {string} sentence
 * @return {string}
 */
var replaceWords = function (dictionary, sentence) {
  const trie = {};
  for (let root of dictionary) {
    let node = trie;
    for (let char of root) {
      if (!node[char]) {
        node[char] = {};
      }
      node = node[char];
    }
    node.isEnd = true; // Mark the end of a root
  }
  function findRoot(word) {
    let node = trie;
    let prefix = "";
    for (let char of word) {
      if (!node[char]) break;
      prefix += char;
      node = node[char];
      if (node.isEnd) return prefix;
    }
    return word; // No root found, return the original word
  }
  console.log("trie--", trie);
  return sentence
    .split(" ")
    .map((word) => findRoot(word))
    .join(" ");
};
