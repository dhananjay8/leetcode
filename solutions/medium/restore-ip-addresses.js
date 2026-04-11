/**
 * Problem: Restore IP Addresses
 * Link: https://leetcode.com/problems/restore-ip-addresses/
 * Difficulty: Medium
 *
 * Return all valid IP addresses from a string of digits.
 *
 * Example: "25525511135" => ["255.255.11.135","255.255.111.35"]
 *
 * Time Complexity: O(1) bounded by IP format (max 27 combinations)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Backtracking
function restoreIpAddresses(s) {
  const result = [];

  function backtrack(start, parts) {
    if (parts.length === 4) {
      if (start === s.length) result.push(parts.join('.'));
      return;
    }

    for (let len = 1; len <= 3; len++) {
      if (start + len > s.length) break;
      const segment = s.substring(start, start + len);
      if (segment.length > 1 && segment[0] === '0') break; // no leading zeros
      if (parseInt(segment) > 255) break; // max 255

      parts.push(segment);
      backtrack(start + len, parts);
      parts.pop(); // backtrack
    }
  }

  backtrack(0, []);
  return result;
}

module.exports = restoreIpAddresses;

/* Python Solution:

def restoreIpAddresses(s):
    result = []
    
    def backtrack(start, parts):
        if len(parts) == 4:
            if start == len(s): result.append('.'.join(parts))
            return
        for length in range(1, 4):
            if start + length > len(s): break
            segment = s[start:start+length]
            if len(segment) > 1 and segment[0] == '0': break
            if int(segment) > 255: break
            parts.append(segment)
            backtrack(start + length, parts)
            parts.pop()
    
    backtrack(0, [])
    return result

*/
