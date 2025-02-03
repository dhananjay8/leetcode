# /**
#  * @param {number[]} nums
#  * @return {number}
#  */
# var jump = function(nums) {
#     if(nums.length === 1) return 0;
#     let minJumps = 0;     // Tracks the number of jumps
#     let currentEnd = 0;   // The farthest index we can reach in the current jump
#     let farthest = 0;     // The farthest index reachable overall

#     // Iterate over the array (excluding the last element)
#     for(let i = 0; i < nums.length-1; i++){
#         // •	nums[i] tells us how far we can jump from index i.
# 	    // •	i + nums[i] calculates the maximum index we can potentially reach from i.
#         farthest = Math.max(farthest, nums[i]+i);
        
#         // If we reach the end of the current jump range
#         if(i === currentEnd){
#             minJumps++;
#             currentEnd = farthest; // Move the current range forward

#             // If we can reach or exceed the last index, break early
#             if(currentEnd >= nums.length-1) break;
#         }
#     }
#     return minJumps;
# };

class Solution:
    def jump(self, nums: List[int]) -> int:
        n = len(nums)
        if n == 1:
            return 0  # No jumps needed if there is only one element

        jumps = 0
        current_end = 0
        farthest = 0
        
        for i in range(n - 1):
            farthest = max(farthest, i + nums[i])
            
            if i == current_end:
                jumps += 1
                current_end = farthest
                
                if current_end >= n - 1:
                    break
        
        return jumps


