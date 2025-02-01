/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
  // If there is only one row or the string length is less than numRows, return the string as is
  if (numRows === 1 || s.length <= numRows) return s;

  // Create an array to store rows, initializing each row as an empty string
  let rows = Array.from({ length: numRows }, () => "");

  // Initialize variables to track the current row and direction of traversal
  let currRow = 0;
  let goingDown = false;

  // Iterate over each character in the input string
  for (let char of s) {
    // Append the character to the current row
    rows[currRow] += char;

    // If we reach the top (row 0) or bottom (last row), change direction
    if (currRow === 0 || currRow === numRows - 1) {
      goingDown = !goingDown;
    }

    // Move to the next row in the correct direction
    currRow += goingDown ? 1 : -1;
  }

  // Join all rows together to get the final zigzag pattern string
  return rows.join("");
};
