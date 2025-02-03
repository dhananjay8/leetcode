class Solution:
    def canJump(self, nums: List[int]) -> bool:
        n = len(nums)
        last_reachable = nums[0]
        for i in range(1, n):
            if i > last_reachable:
                return False
            last_reachable = max(last_reachable, i + nums[i])
        return True
    
# /**
#  * @param {number[]} nums
#  * @return {boolean}
#  */
# var canJump = function(nums) {
#     let n = nums.length;
#     let last_reachable = nums[0];
#     for(let i = 1; i < n; i++){
#         const currentJump = nums[i];
#         if(i > last_reachable){
#             // This means jump is outside of our reachable limit
#             return false;
#         }
#         last_reachable = Math.max(last_reachable, i+currentJump);
#     }
#     return true;
# };