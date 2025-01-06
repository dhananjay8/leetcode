class Solution {
  /**
   * @param {string[]} strs
   * @returns {string}
   */
  encode(strs) {
    let encodedString = "";
    for (const s of strs) {
      // Each string is encoded as "length:string"
      encodedString += `${s.length}:${s}`;
    }
    console.log("encodedString--", encodedString);
    return encodedString;
  }

  /**
   * @param {string} str
   * @returns {string[]}
   */
  decode(str) {
    const decodedStrings = [];
    let i = 0;

    while (i < str.length) {
      // Find the delimiter ':' to get the length of the next string
      const j = str.indexOf(":", i);
      const length = parseInt(str.slice(i, j), 10); // Get the length part as an integer
      // Extract the string using the length and add to the result
      decodedStrings.push(str.slice(j + 1, j + 1 + length));
      // Move the pointer to the end of the current string
      i = j + 1 + length;
    }

    return decodedStrings;
  }
}
