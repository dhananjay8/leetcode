// Find All Anagrams of a String
var findPermutations = function (str) {
  const results = []; // Array to store all permutations

  // Helper function for recursive permutation generation
  const permute = (currentPermutation, remainingChars) => {
    // Base case: when no more characters are left, we have a complete permutation
    if (remainingChars.length === 0) {
      results.push(currentPermutation); // Add the complete permutation to the results
      return;
    }

    // Recursive case: for each character in the remaining characters, create new permutations
    for (let i = 0; i < remainingChars.length; i++) {
      // Append the current character to the currentPermutation and
      // remove it from the remainingChars for the next recursive step
      permute(
        currentPermutation + remainingChars[i], // alreadyDone + currentString
        remainingChars.slice(0, i) + remainingChars.slice(i + 1) // Remove the current character
      );
    }
  };

  // Start the recursion with an empty currentPermutation and the full string as remainingChars
  permute("", str);

  return results; // Return the array of all permutations
};

// Find All Palindromes in a String
var findAllPalindromes = function (str) {
  //   const isPalindrome = (s) => s === s.split("").reverse().join("");
  const isPalindrome = (s, start, end) => {
    while (start < end) {
      if (s[start] !== s[end]) return false;
      start++;
      end--;
    }
    return true;
  };
  const palindromes = new Set();

  for (let i = 0; i < str.length; i++) {
    for (let j = i + 1; j <= str.length; j++) {
      const substr = str.slice(i, j);
      if (isPalindrome(substr)) {
        palindromes.add(substr); // Use a set to avoid duplicates
      }
    }
  }

  return Array.from(palindromes);
};

// Find the Length of the Largest Common Substring (Array of Strings)
var largestCommonSubstringLength = function (strings) {
  const firstString = strings[0];
  let maxLength = 0;

  for (let i = 0; i < firstString.length; i++) {
    for (let j = i + 1; j <= firstString.length; j++) {
      const substr = firstString.slice(i, j); // Use `slice` to extract the substring
      let isCommon = true;

      // Check substr presence in all other strings
      for (let k = 1; k < strings.length; k++) {
        if (!strings[k].includes(substr)) {
          // Use `.includes` for substring search
          isCommon = false;
          break;
        }
      }

      if (isCommon) {
        maxLength = Math.max(maxLength, substr.length);
      }
    }
  }

  return maxLength;
};

// Find the Length of the Smallest Common Substring (Array of Strings)
var smallestCommonSubstringLength = function (strings) {
  const firstString = strings[0];

  for (let length = 1; length <= firstString.length; length++) {
    for (let i = 0; i <= firstString.length - length; i++) {
      const substr = firstString.slice(i, i + length); // Use `slice` to extract substrings
      let isCommon = true;

      // Check substr presence in all other strings
      for (let k = 1; k < strings.length; k++) {
        if (!strings[k].includes(substr)) {
          // Use `.includes` for substring search
          isCommon = false;
          break;
        }
      }

      if (isCommon) {
        return substr.length; // Return the smallest common substring length
      }
    }
  }

  return 0; // No common substring found
};
