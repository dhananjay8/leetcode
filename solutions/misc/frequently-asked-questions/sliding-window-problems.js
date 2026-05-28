/**
 * Sliding Window — 5 Core Problems
 *
 * Template:
 *   left = 0
 *   for right in range(n):
 *     expand window (add arr[right])
 *     while window_invalid:
 *       shrink window (remove arr[left++])
 *     update answer
 *
 * Problems:
 *   LC 76  — Minimum Window Substring (Hard)
 *   LC 209 — Minimum Size Subarray Sum (Medium)
 *   LC 424 — Longest Repeating Character Replacement (Medium)
 *   LC 567 — Permutation in String (Medium)
 *   LC 904 — Fruit Into Baskets (Medium)
 */

// ═══════════════════════════════════════════════════════
// LC 76 — Minimum Window Substring
// Time: O(|s| + |t|)  Space: O(|t|)
// ═══════════════════════════════════════════════════════
function minWindow(s, t) {
  if (t.length > s.length) return "";
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);

  let have = 0, required = need.size;
  const window = new Map();
  let res = "", resLen = Infinity;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) || 0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) have++;

    while (have === required) {
      if (right - left + 1 < resLen) {
        resLen = right - left + 1;
        res = s.slice(left, right + 1);
      }
      const lc = s[left++];
      window.set(lc, window.get(lc) - 1);
      if (need.has(lc) && window.get(lc) < need.get(lc)) have--;
    }
  }
  return res;
}

// ═══════════════════════════════════════════════════════
// LC 209 — Minimum Size Subarray Sum
// Time: O(n)  Space: O(1)
// ═══════════════════════════════════════════════════════
function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, minLen = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left++];
    }
  }
  return minLen === Infinity ? 0 : minLen;
}

// ═══════════════════════════════════════════════════════
// LC 424 — Longest Repeating Character Replacement
// Time: O(n)  Space: O(26)
// ═══════════════════════════════════════════════════════
function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  let left = 0, maxFreq = 0, res = 0;

  for (let right = 0; right < s.length; right++) {
    count[s.charCodeAt(right) - 65]++;
    maxFreq = Math.max(maxFreq, count[s.charCodeAt(right) - 65]);

    // window size - maxFreq = replacements needed
    while (right - left + 1 - maxFreq > k) {
      count[s.charCodeAt(left++) - 65]--;
    }
    res = Math.max(res, right - left + 1);
  }
  return res;
}

// ═══════════════════════════════════════════════════════
// LC 567 — Permutation in String
// Time: O(n)  Space: O(26)
// ═══════════════════════════════════════════════════════
function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const need = new Array(26).fill(0);
  const have = new Array(26).fill(0);

  for (const c of s1) need[c.charCodeAt(0) - 97]++;

  let left = 0, matches = 0;
  const required = s1.length;

  for (let right = 0; right < s2.length; right++) {
    const idx = s2.charCodeAt(right) - 97;
    have[idx]++;
    if (need[idx] > 0 && have[idx] <= need[idx]) matches++;

    if (right - left + 1 > required) {
      const li = s2.charCodeAt(left++) - 97;
      if (need[li] > 0 && have[li] <= need[li]) matches--;
      have[li]--;
    }

    if (matches === required) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════
// LC 904 — Fruit Into Baskets
// = Longest subarray with at most 2 distinct values
// Time: O(n)  Space: O(1) — at most 2 types
// ═══════════════════════════════════════════════════════
function totalFruit(fruits) {
  const basket = new Map();
  let left = 0, res = 0;

  for (let right = 0; right < fruits.length; right++) {
    basket.set(fruits[right], (basket.get(fruits[right]) || 0) + 1);

    while (basket.size > 2) {
      const lf = fruits[left++];
      basket.set(lf, basket.get(lf) - 1);
      if (basket.get(lf) === 0) basket.delete(lf);
    }
    res = Math.max(res, right - left + 1);
  }
  return res;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(minWindow("ADOBECODEBANC", "ABC"));           // "BANC"
console.log(minSubArrayLen(7, [2,3,1,2,4,3]));            // 2
console.log(characterReplacement("AABABBA", 1));          // 4
console.log(checkInclusion("ab", "eidbaooo"));            // true
console.log(totalFruit([1,2,1,2,3]));                     // 4

module.exports = { minWindow, minSubArrayLen, characterReplacement, checkInclusion, totalFruit };
