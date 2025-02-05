/**
 * @param {number} num
 * @return {string}
 */
var intToRoman = function (num) {
  // Define the mapping of integer values to Roman numerals
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];

  let result = "";

  // Iterate through the values and append corresponding Roman symbols
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i]; // Append the Roman numeral
      num -= values[i]; // Subtract the corresponding value
    }
  }

  return result;
};
