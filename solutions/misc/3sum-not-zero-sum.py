def three_sum(nums, z):
    triplets = []
    nums.sort()  # Sort the array
    
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # Skip duplicates
        
        left = i + 1
        right = len(nums) - 1
        
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            
            if total == z:
                triplets.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                
                # Skip duplicates
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
            elif total < z:
                left += 1
            else:
                right -= 1
                
    return triplets

test_cases = [
    ([-1, 0, 1, 2, -1, -4], 0),
    ([], 0),  # Empty array
    ([0, 1, 1], 0),  # All zeros
    ([1, 2, 3, 4, 5], 9),  # No triplet
    ([-2, 0, 1, 1, 2], 0),  # Duplicates
    ([-1, 0, 1, 2, -1, -4, 2, -3], 0),  # Multiple solutions
    ([-1,0,1,2,-1,-4], 0)
]

for nums, target in test_cases:
    print("Input:", nums)
    print("Target:", target)
    print("Triplets:", three_sum(nums, target))
    print()
