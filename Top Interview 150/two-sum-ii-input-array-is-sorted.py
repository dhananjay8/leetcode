# using two pointers
class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        l, r = 0, len(numbers) - 1
        while l < r:
            currSum = numbers[l] + numbers[r]
            if currSum < target:
                l += 1
            elif currSum > target:
                r -= 1
            else:
                return [l+1, r+1]


# using map
class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        m = {}
        for i in range(0, len(numbers)):
            if(target-numbers[i] in m):
                return [m[target-numbers[i]]+1, i+1]
            m[numbers[i]] = i
        print(m)
        return []