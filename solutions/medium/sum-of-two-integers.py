class Solution:
    def getSum(self, a: int, b: int) -> int:
        # mask to limit the numbers to 32 bits
        mask = 0xFFFFFFFF  # This is a 32-bit mask with all bits set to 1 (111...111 in binary).
        
        # maximum positive value for a 32-bit signed integer
        maxInt = 2**31 - 1  # This is 2^31 - 1, which equals 2147483647. It's the maximum value for a signed 32-bit integer.
        
        # Loop until there is no carry (b becomes 0)
        while b != 0:
            # XOR operation adds the numbers without considering the carry
            sum = (a ^ b) & mask  # Use XOR to calculate the sum without carry. `& mask` ensures it's within 32 bits.
            
            # AND operation followed by left shift calculates the carry
            carry = (a & b) & mask  # Use AND to calculate the carry. `& mask` ensures it's within 32 bits.
            
            # Update a to the current sum and b to the carry left-shifted by 1 (to add in the next loop)
            a = sum  # The sum becomes the new value of a.
            b = carry << 1  # Shift the carry left by 1 bit for the next addition.
        
        # If a is within the range of a 32-bit signed integer, return a as is
        # Otherwise, return the two's complement negative equivalent
        return a if a <= maxInt else ~(a ^ mask)  # If `a` exceeds the maximum 32-bit integer value, convert it to negative.


class Solution:
    def getSum(self, a: int, b: int) -> int:
        # Continue looping as long as there is a carry
        while (a & b) != 0:
            # Calculate the carry by performing bitwise AND and shifting left by 1
            carry = (a & b) << 1
            # Perform bitwise XOR to get the sum without considering carry
            a = a ^ b
            # Move the carry to the next higher bit position
            b = carry
        
        # The result is the sum of a and b, excluding the carry at this point
        return a ^ b
