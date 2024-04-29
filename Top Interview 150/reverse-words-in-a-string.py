class Solution:
    def reverseWords(self, s: str) -> str:
        stack = []
        result = []
        for i in range(1, len(s)+1):
            # print(s[-i])
            # print('stack', stack)
            if s[-i] != " ":
                stack.append(s[-i])
            else:
                if stack:
                    result.append(''.join(stack[::-1]))
                    stack = []
            # print('result', stack, result)

        if stack:
            result.append(''.join(stack[::-1]))
        return (' '.join(result))