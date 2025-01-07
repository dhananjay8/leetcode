from typing import List

class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        pLen = len(p)
        sLen = len(s)

        # Early exit if s is shorter than p
        if sLen < pLen:
            return []

        # Initialize frequency arrays for 'a' to 'z'
        pCount = [0] * 26
        sCount = [0] * 26
        results = []

        # Populate frequency count for p
        for char in p:
            pCount[ord(char) - ord('a')] += 1

        # Populate frequency count for the first window in s
        for char in s[:pLen]:
            sCount[ord(char) - ord('a')] += 1

        # Check if the initial window matches
        if sCount == pCount:
            results.append(0)

        # Sliding window: Move the window one character at a time
        for i in range(pLen, sLen):
            # Add the new character to the window
            sCount[ord(s[i]) - ord('a')] += 1
            
            # Remove the character that is sliding out of the window
            sCount[ord(s[i - pLen]) - ord('a')] -= 1

            # Compare frequency arrays
            if sCount == pCount:
                results.append(i - pLen + 1)

        return results