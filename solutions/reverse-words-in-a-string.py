# const stack = [];
#   const result = [];
  
#   for (let i = s.length - 1; i >= 0; i--) {
#     if (s[i] !== " ") {
#       stack.push(s[i]);
#     } else {
#       if (stack.length > 0) {
#         let word = "";
#         while (stack.length > 0) {
#           word += stack.pop(); // Build the word manually by popping from the stack
#         }
#         result.push(word); // Add the reversed word to the result
#       }
#     }
#   }

#   // Add the last word if there is any
#   if (stack.length > 0) {
#     let word = "";
#     while (stack.length > 0) {
#       word += stack.pop();
#     }
#     result.push(word);
#   }

#   // Build the final string manually without using join
#   let finalString = "";
#   for (let i = 0; i < result.length; i++) {
#     if (i > 0) {
#       finalString += " "; // Add space between words
#     }
#     finalString += result[i];
#   }

#   return finalString;

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