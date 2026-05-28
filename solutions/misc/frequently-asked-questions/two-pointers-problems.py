"""
Two Pointers — 6 Core Problems (Python)

LC 11 — Container With Most Water
LC 15 — 3Sum
LC 26 — Remove Duplicates from Sorted Array
LC 42 — Trapping Rain Water
LC 75 — Sort Colors
LC 88 — Merge Sorted Array
"""

from typing import List


# LC 11 — O(n)
def max_area(height: List[int]) -> int:
    """Container With Most Water: max area formed by two lines."""
    left, right, res = 0, len(height) - 1, 0
    while left < right:
        # Area = min height * width (distance between pointers)
        res = max(res, min(height[left], height[right]) * (right - left))
        # Move the pointer with smaller height (potential to find larger area)
        if height[left] < height[right]: left += 1
        else: right -= 1
    return res


# LC 15 — O(n²)
def three_sum(nums: List[int]) -> List[List[int]]:
    """3Sum: find all unique triplets that sum to zero."""
    nums.sort()  # Sort to enable two-pointer technique
    res = []
    for i in range(len(nums) - 2):
        # Skip duplicate values for the first element
        if i > 0 and nums[i] == nums[i-1]: continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                res.append([nums[i], nums[left], nums[right]])
                # Skip duplicates for second and third elements
                while left < right and nums[left] == nums[left+1]: left += 1
                while left < right and nums[right] == nums[right-1]: right -= 1
                left += 1; right -= 1
            elif s < 0: left += 1  # Need larger sum, move left pointer right
            else: right -= 1  # Need smaller sum, move right pointer left
    return res


# LC 26 — O(n)
def remove_duplicates(nums: List[int]) -> int:
    """Remove Duplicates from Sorted Array in-place."""
    k = 1  # Position to place next unique element
    for i in range(1, len(nums)):
        if nums[i] != nums[i-1]:
            nums[k] = nums[i]; k += 1
    return k


# LC 42 — Trapping Rain Water — O(n)
def trap(height: List[int]) -> int:
    """Calculate total water that can be trapped between bars."""
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        # Process the side with smaller height (water level limited by min)
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]; left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]; right -= 1
    return water


# LC 75 — Dutch National Flag — O(n)
def sort_colors(nums: List[int]) -> None:
    """Sort array of 0s, 1s, 2s in-place using three-way partition."""
    low = mid = 0
    high = len(nums) - 1
    # [0, low) = 0s, [low, mid) = 1s, (high, end] = 2s
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]; low += 1; mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:  # nums[mid] == 2
            nums[mid], nums[high] = nums[high], nums[mid]; high -= 1


# LC 88 — Merge Sorted Array — O(m+n)
def merge(nums1: List[int], m: int, nums2: List[int], n: int) -> None:
    """Merge nums2 into nums1 in-place (nums1 has space for m+n elements)."""
    p1, p2, p = m - 1, n - 1, m + n - 1
    # Merge from the end to avoid overwriting unprocessed elements
    while p2 >= 0:
        if p1 >= 0 and nums1[p1] > nums2[p2]:
            nums1[p] = nums1[p1]; p1 -= 1
        else:
            nums1[p] = nums2[p2]; p2 -= 1
        p -= 1


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(max_area([1,8,6,2,5,4,8,3,7]))           # 49
    print(three_sum([-1,0,1,2,-1,-4]))              # [[-1,-1,2],[-1,0,1]]
    print(trap([0,1,0,2,1,0,1,3,2,1,2,1]))         # 6

    colors = [2,0,2,1,1,0]; sort_colors(colors)
    print(colors)                                    # [0,0,1,1,2,2]

    nums1 = [1,2,3,0,0,0]; merge(nums1, 3, [2,5,6], 3)
    print(nums1)                                     # [1,2,2,3,5,6]
