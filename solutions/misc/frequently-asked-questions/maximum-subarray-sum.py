"""
Maximum Subarray Sum (LC 53) — Medium
Pattern: Kadane's Algorithm

Time:  O(n)
Space: O(1)
"""

from typing import List, Tuple


def max_subarray(nums: List[int]) -> int:
    """Kadane's algorithm: find maximum sum of contiguous subarray."""
    max_sum = cur = nums[0]
    for n in nums[1:]:
        # Either start new subarray at n, or extend current subarray with n
        cur = max(n, cur + n)
        # Track the maximum sum seen so far
        max_sum = max(max_sum, cur)
    return max_sum


def max_subarray_with_indices(nums: List[int]) -> Tuple[int, int, int]:
    """Kadane's algorithm that also returns the start and end indices of max subarray."""
    max_sum = cur = nums[0]
    start = end = temp_start = 0

    for i in range(1, len(nums)):
        # If starting fresh at nums[i] gives better sum than extending, reset
        if cur + nums[i] < nums[i]:
            cur = nums[i]
            temp_start = i  # Mark potential new start of max subarray
        else:
            cur += nums[i]  # Extend current subarray

        # Update max_sum and indices if we found a better subarray
        if cur > max_sum:
            max_sum = cur
            start = temp_start
            end = i

    return max_sum, start, end


def max_subarray_circular(nums: List[int]) -> int:
    """LC 918 — Maximum Sum Circular Subarray.
    Key insight: max circular = max(max_linear, total - min_linear)
    Edge case: if all numbers are negative, return max_linear (not total - min_linear)
    """
    total = sum(nums)
    max_sum = cur_max = nums[0]
    min_sum = cur_min = nums[0]

    for n in nums[1:]:
        # Kadane's for maximum subarray
        cur_max = max(n, cur_max + n)
        max_sum = max(max_sum, cur_max)
        # Kadane's for minimum subarray (negated logic)
        cur_min = min(n, cur_min + n)
        min_sum = min(min_sum, cur_min)

    # If max_sum is positive, circular answer is max of linear or (total - min_linear)
    # If max_sum is negative (all numbers negative), return max_sum (the least negative)
    return max(max_sum, total - min_sum) if max_sum > 0 else max_sum


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(max_subarray([-2,1,-3,4,-1,2,1,-5,4]))             # 6
    print(max_subarray_with_indices([-2,1,-3,4,-1,2,1,-5,4]))# (6, 3, 6)
    print(max_subarray_circular([1,-2,3,-2]))                  # 3
    print(max_subarray_circular([5,-3,5]))                     # 10
