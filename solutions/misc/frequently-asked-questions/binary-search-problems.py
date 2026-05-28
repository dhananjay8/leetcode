"""
Binary Search — 4 Core Problems (Python)

LC 33  — Search in Rotated Sorted Array
LC 153 — Find Minimum in Rotated Sorted Array
LC 162 — Find Peak Element
LC 704 — Binary Search
"""

from typing import List


# LC 704 — O(log n)
def search(nums: List[int], target: int) -> int:
    """Standard binary search on sorted array."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) >> 1  # Bitwise divide by 2 (equivalent to (lo+hi)//2)
        if nums[mid] == target: return mid
        elif nums[mid] < target: lo = mid + 1  # Target in right half
        else: hi = mid - 1  # Target in left half
    return -1


# LC 33 — O(log n)
def search_rotated(nums: List[int], target: int) -> int:
    """Search in rotated sorted array (no duplicates)."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) >> 1
        if nums[mid] == target: return mid
        # Determine which half is sorted
        if nums[lo] <= nums[mid]:  # Left half is sorted
            if nums[lo] <= target < nums[mid]: hi = mid - 1  # Target in left half
            else: lo = mid + 1  # Target in right half
        else:  # Right half is sorted
            if nums[mid] < target <= nums[hi]: lo = mid + 1  # Target in right half
            else: hi = mid - 1  # Target in left half
    return -1


# LC 153 — O(log n)
def find_min(nums: List[int]) -> int:
    """Find minimum in rotated sorted array (no duplicates)."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) >> 1
        # If mid > hi, min is in right half (rotation point)
        if nums[mid] > nums[hi]: lo = mid + 1
        else: hi = mid  # Min is in left half (including mid)
    return nums[lo]


# LC 162 — O(log n)
def find_peak_element(nums: List[int]) -> int:
    """Find a peak element (nums[i] > nums[i-1] and nums[i] > nums[i+1])."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) >> 1
        # If mid > mid+1, we're on descending slope → peak is to the left
        if nums[mid] > nums[mid + 1]: hi = mid
        # If mid < mid+1, we're on ascending slope → peak is to the right
        else: lo = mid + 1
    return lo


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(search([1,2,3,4,5,6], 4))              # 3
    print(search_rotated([4,5,6,7,0,1,2], 0))    # 4
    print(search_rotated([4,5,6,7,0,1,2], 3))    # -1
    print(find_min([3,4,5,1,2]))                 # 1
    print(find_min([4,5,6,7,0,1,2]))             # 0
    print(find_peak_element([1,2,3,1]))          # 2
