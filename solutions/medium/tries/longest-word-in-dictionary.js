var longestWord = function (words) {
  // Sort words first by length and then lexicographically
  words.sort((a, b) =>
    a.length === b.length ? a.localeCompare(b) : a.length - b.length
  );

  const wordSet = new Set();
  let longest = "";

  for (const word of words) {
    // Check if the word can be built one character at a time
    if (word.length === 1 || wordSet.has(word.slice(0, -1))) {
      wordSet.add(word);
      // Update the longest word if necessary
      if (
        word.length > longest.length ||
        (word.length === longest.length && word < longest)
      ) {
        longest = word;
      }
    }
  }

  return longest;
};
