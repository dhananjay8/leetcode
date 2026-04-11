/**
 * Problem: Word Ladder
 * Link: https://leetcode.com/problems/word-ladder/
 * Difficulty: Hard
 *
 * Find shortest transformation from beginWord to endWord, changing one letter at a time.
 *
 * Example: beginWord="hit", endWord="cog", wordList=["hot","dot","dog","lot","log","cog"] => 5
 *
 * Time Complexity: O(M^2 * N) where M is word length, N is word list size
 * Space Complexity: O(M^2 * N)
 */

// JavaScript Solution - BFS
function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  const queue = [[beginWord, 1]]; // [word, steps]
  const visited = new Set([beginWord]);

  while (queue.length) {
    const [word, steps] = queue.shift();

    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) { // a-z
        const newWord = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        if (newWord === endWord) return steps + 1;
        if (wordSet.has(newWord) && !visited.has(newWord)) {
          visited.add(newWord);
          queue.push([newWord, steps + 1]);
        }
      }
    }
  }

  return 0; // no transformation found
}

module.exports = ladderLength;

/* Python Solution:

from collections import deque

def ladderLength(beginWord, endWord, wordList):
    word_set = set(wordList)
    if endWord not in word_set: return 0
    
    queue = deque([(beginWord, 1)])
    visited = {beginWord}
    
    while queue:
        word, steps = queue.popleft()
        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                new_word = word[:i] + c + word[i+1:]
                if new_word == endWord: return steps + 1
                if new_word in word_set and new_word not in visited:
                    visited.add(new_word)
                    queue.append((new_word, steps + 1))
    
    return 0

*/
