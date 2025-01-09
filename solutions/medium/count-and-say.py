class Solution:
    def countAndSay(self, n: int) -> str:
        # Base case: if n is 1, return "1"
        if n == 1:
            return "1"
        
        # Recursive call for the previous sequence
        prev_seq = self.countAndSay(n - 1)
        
        # Generate the current sequence using Run-Length Encoding
        result = []
        count = 1
        
        for i in range(1, len(prev_seq)):
            if prev_seq[i] == prev_seq[i - 1]:
                count += 1  # Increment count for consecutive characters
            else:
                # Append the count and the character
                result.append(str(count))
                result.append(prev_seq[i - 1])
                count = 1  # Reset the count
        
        # Add the last group
        result.append(str(count))
        result.append(prev_seq[-1])
        
        return ''.join(result)