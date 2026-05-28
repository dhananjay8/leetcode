"""
Sliding Window — 5 Core Problems (Python)

LC 76  — Minimum Window Substring
LC 209 — Minimum Size Subarray Sum
LC 424 — Longest Repeating Character Replacement
LC 567 — Permutation in String
LC 904 — Fruit Into Baskets
"""

from collections import Counter, defaultdict
from typing import List


# LC 76 — Minimum Window Substring — O(|s|+|t|)
def min_window(s: str, t: str) -> str:
    if len(t) > len(s):
        return ""
    # Count of each character needed from t
    need = Counter(t)
    # Count of each character in current window
    window: Counter = Counter()
    # have = number of unique chars in window that meet required count
    # required = number of unique chars in t
    have, required = 0, len(need)
    left, res, res_len = 0, "", float("inf")

    for right, c in enumerate(s):
        window[c] += 1
        # If current char is in t and we just met its required count, increment have
        if c in need and window[c] == need[c]:
            have += 1
        # When window contains all required chars, try to shrink from left
        while have == required:
            if right - left + 1 < res_len:
                res_len = right - left + 1
                res = s[left:right+1]
            # Remove leftmost char from window and adjust have if needed
            lc = s[left]; left += 1
            window[lc] -= 1
            if lc in need and window[lc] < need[lc]:
                have -= 1
    return res


# LC 209 — Minimum Size Subarray Sum — O(n)
def min_sub_array_len(target: int, nums: List[int]) -> int:
    left = total = 0
    res = float("inf")
    for right, n in enumerate(nums):
        total += n
        # Shrink window from left while sum >= target
        while total >= target:
            res = min(res, right - left + 1)
            total -= nums[left]; left += 1
    return 0 if res == float("inf") else res


# LC 424 — Longest Repeating Character Replacement — O(n)
def character_replacement(s: str, k: int) -> int:
    count = [0] * 26
    left = max_freq = res = 0
    for right, c in enumerate(s):
        count[ord(c) - 65] += 1
        max_freq = max(max_freq, count[ord(c) - 65])
        # If window size - max_freq > k, we need more than k replacements → shrink
        while right - left + 1 - max_freq > k:
            count[ord(s[left]) - 65] -= 1; left += 1
        res = max(res, right - left + 1)
    return res


# LC 567 — Permutation in String — O(n)
def check_inclusion(s1: str, s2: str) -> bool:
    if len(s1) > len(s2):
        return False
    # Frequency map of s1 (what we need to match)
    need = Counter(s1)
    # Frequency map of current window in s2
    window: Counter = Counter()
    matches = 0
    required = len(s1)
    left = 0

    for right, c in enumerate(s2):
        window[c] += 1
        # If adding this char helps match s1's frequency, increment matches
        if need[c] > 0 and window[c] <= need[c]:
            matches += 1
        # If window exceeds required size, shrink from left
        if right - left + 1 > required:
            lc = s2[left]; left += 1
            if need[lc] > 0 and window[lc] <= need[lc]:
                matches -= 1
            window[lc] -= 1
        # If all characters match, s1's permutation exists in s2
        if matches == required:
            return True
    return False


# LC 904 — Fruit Into Baskets — O(n)
# Equivalent to: longest subarray with at most 2 distinct values
def total_fruit(fruits: List[int]) -> int:
    basket: Counter = Counter()
    left = res = 0
    for right, f in enumerate(fruits):
        basket[f] += 1
        # If more than 2 fruit types, shrink window from left
        while len(basket) > 2:
            basket[fruits[left]] -= 1
            if basket[fruits[left]] == 0:
                del basket[fruits[left]]
            left += 1
        res = max(res, right - left + 1)
    return res


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(min_window("ADOBECODEBANC", "ABC"))      # "BANC"
    print(min_sub_array_len(7, [2,3,1,2,4,3]))     # 2
    print(character_replacement("AABABBA", 1))     # 4
    print(check_inclusion("ab", "eidbaooo"))       # True
    print(total_fruit([1,2,1,2,3]))                # 4
