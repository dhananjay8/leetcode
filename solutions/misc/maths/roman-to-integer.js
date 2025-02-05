/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function (s) {
  const romanMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let val = null;
  for (let i = 0; i < s.length; i++) {
    const currentChar = s[i],
      nextChar = s[i + 1];
    const currentCharIntVal = romanMap[currentChar];
    const nextCharIntVal = romanMap[nextChar];
    val =
      nextCharIntVal > currentCharIntVal
        ? val - currentCharIntVal
        : val + currentCharIntVal;
  }
  return val;
};
