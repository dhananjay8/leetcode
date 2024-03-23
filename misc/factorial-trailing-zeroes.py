class Solution:
    def trailingZeroes(self, n: int) -> int:
        count=0
        while n>=5:
            n//=5 # Perform floor division
            count+=n
        return count
        