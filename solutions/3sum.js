/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  const results = new Set();

  const neg = [],
    pos = [],
    zeros = [];

  for (const num of nums) {
    if (num === 0) {
      zeros.push(num);
    } else {
      num < 0 ? neg.push(num) : pos.push(num);
    }
  }

  const uniqueNeg = new Set(neg),
    uniquePos = new Set(pos);

  if (zeros.length >= 3) {
    results.add([0, 0, 0].toString());
  }

  if (zeros.length > 0) {
    for (const num of uniquePos) {
      if (uniqueNeg.has(-1 * num)) {
        results.add([-1 * num, 0, num].sort().toString());
      }
    }
  }

  // check if 2 positive makes a negative
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      const targetSum = -1 * (pos[i] + pos[j]);
      if (uniqueNeg.has(targetSum))
        results.add([pos[i], pos[j], targetSum].sort().toString());
    }
  }

  // check if 2 negative makes a positive
  for (let i = 0; i < neg.length; i++) {
    for (let j = i + 1; j < neg.length; j++) {
      const targetSum = -1 * (neg[i] + neg[j]);
      if (uniquePos.has(targetSum))
        results.add([neg[i], neg[j], targetSum].sort().toString());
    }
  }

  return results.size > 0
    ? Array.from(results).map((item) => item.split(",").map(Number))
    : [];
};
