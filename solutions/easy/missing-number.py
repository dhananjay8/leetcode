class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        arrLen = len(nums)
        arrSum = (arrLen*(arrLen+1))//2
        return arrSum - sum(nums)
        
# /**
#  * @param {number[]} nums
#  * @return {number}
#  */
# var firstMissingPositive = function(nums) {
#     let x=1;
#     nums.sort((a, b) => a-b);
#     for(let i=0;i<nums.length; i++) {
#         if(nums[i] == x){
#             x++
#         }
#     }
#     return x
# };