"""
Dynamic Programming — 6 Core Problems (Python)

LC 70  — Climbing Stairs
LC 198 — House Robber
LC 300 — Longest Increasing Subsequence
LC 322 — Coin Change
LC 1143 — Longest Common Subsequence
LC 416 — Partition Equal Subset Sum
"""

import bisect
from typing import List


# LC 70 — O(n) time O(1) space
def climb_stairs(n: int) -> int:
    """Climbing Stairs: ways to reach nth step (can take 1 or 2 steps at a time)."""
    if n <= 2: return n
    prev2, prev1 = 1, 2  # dp[i-2], dp[i-1]
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2  # dp[i] = dp[i-1] + dp[i-2]
    return prev1


# LC 198 — O(n) time O(1) space
def rob(nums: List[int]) -> int:
    """House Robber: max sum of non-adjacent houses."""
    prev2 = prev1 = 0  # dp[i-2], dp[i-1]
    for n in nums:
        # Either skip current house (prev1) or rob it (prev2 + n)
        prev2, prev1 = prev1, max(prev1, prev2 + n)
    return prev1


# LC 300 — LIS — O(n log n) patience sort
def length_of_lis(nums: List[int]) -> int:
    """Longest Increasing Subsequence using patience sorting (binary search)."""
    tails = []  # tails[i] = smallest tail of IS of length i+1
    for n in nums:
        pos = bisect.bisect_left(tails, n)  # Find insertion point
        if pos == len(tails): tails.append(n)  # Extend LIS
        else: tails[pos] = n  # Replace to keep tails minimal
    return len(tails)


# LC 322 — Coin Change — O(amount * coins)
def coin_change(coins: List[int], amount: int) -> int:
    """Minimum coins to make amount (unlimited coin supply)."""
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0  # 0 coins needed to make amount 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)  # Use coin or not
    return dp[amount] if dp[amount] != float("inf") else -1


# LC 1143 — LCS — O(m*n)
def longest_common_subsequence(text1: str, text2: str) -> int:
    """Longest Common Subsequence of two strings."""
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            # If chars match, extend LCS; else take max of excluding one char
            dp[i][j] = dp[i-1][j-1] + 1 if text1[i-1] == text2[j-1] else max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]


# LC 416 — Partition Equal Subset Sum — O(n * sum/2)
def can_partition(nums: List[int]) -> bool:
    """Check if array can be partitioned into two subsets with equal sum."""
    total = sum(nums)
    if total % 2: return False  # Odd total cannot be split equally
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True  # Sum 0 is always achievable
    for n in nums:
        # Iterate backwards to avoid reusing the same element
        for j in range(target, n - 1, -1):
            dp[j] = dp[j] or dp[j - n]  # Can achieve sum j if j-n was achievable
    return dp[target]


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(climb_stairs(10))                              # 89
    print(rob([2,7,9,3,1]))                              # 12
    print(length_of_lis([10,9,2,5,3,7,101,18]))         # 4
    print(coin_change([1,5,11], 15))                     # 3
    print(longest_common_subsequence("abcde", "ace"))    # 3
    print(can_partition([1,5,11,5]))                     # True
    print(can_partition([1,2,3,5]))                      # False
