/**
 * Problem: Text Justification
 * Link: https://leetcode.com/problems/text-justification/
 * Difficulty: Hard
 *
 * Format text to fit maxWidth characters per line with full justification.
 *
 * Example:
 * Input: words = ["This", "is", "an", "example", "of", "text", "justification."], maxWidth = 16
 * Output: [
 *   "This    is    an",
 *   "example  of text",
 *   "justification.  "
 * ]
 *
 * Time Complexity: O(n) where n is total characters
 * Space Complexity: O(m) where m is maxWidth
 */

// JavaScript Solution
function fullJustify(words, maxWidth) {
  const result = [];
  let i = 0;

  while (i < words.length) {
    // Find how many words fit in current line
    let lineWords = [];
    let lineLength = 0;

    while (i < words.length) {
      // Check if adding next word would exceed maxWidth
      // (including at least 1 space between words)
      const wordLength = words[i].length;
      const spacesNeeded = lineWords.length; // minimum spaces between words

      if (lineLength + wordLength + spacesNeeded > maxWidth) {
        break;
      }

      lineWords.push(words[i]);
      lineLength += wordLength;
      i++;
    }

    // Build the line
    let line;

    // Last line or single word line - left justify
    if (i === words.length || lineWords.length === 1) {
      line = lineWords.join(" ");
      line += " ".repeat(maxWidth - line.length);
    } else {
      // Middle lines - full justify
      const totalSpaces = maxWidth - lineLength;
      const gaps = lineWords.length - 1;
      const spacesPerGap = Math.floor(totalSpaces / gaps);
      const extraSpaces = totalSpaces % gaps;

      line = "";
      for (let j = 0; j < lineWords.length; j++) {
        line += lineWords[j];

        if (j < gaps) {
          // Add base spaces
          line += " ".repeat(spacesPerGap);
          // Add extra space to leftmost gaps
          if (j < extraSpaces) {
            line += " ";
          }
        }
      }
    }

    result.push(line);
  }

  return result;
}

// Test cases
console.log(
  fullJustify(
    ["This", "is", "an", "example", "of", "text", "justification."],
    16
  )
);
// ["This    is    an", "example  of text", "justification.  "]

console.log(
  fullJustify(["What", "must", "be", "acknowledgment", "shall", "be"], 16)
);
// ["What   must   be", "acknowledgment  ", "shall be        "]

console.log(
  fullJustify(
    [
      "Science",
      "is",
      "what",
      "we",
      "understand",
      "well",
      "enough",
      "to",
      "explain",
      "to",
      "a",
      "computer.",
      "Art",
      "is",
      "everything",
      "else",
      "we",
      "do",
    ],
    20
  )
);

module.exports = fullJustify;

/* Python Solution (commented):

def full_justify(words: list[str], max_width: int) -> list[str]:
    """
    Format text with full justification
    
    Args:
        words: List of words to format
        max_width: Maximum characters per line
    
    Returns:
        List of justified lines
    
    Time Complexity: O(n)
    Space Complexity: O(m)
    """
    result = []
    i = 0
    
    while i < len(words):
        # Find how many words fit in current line
        line_words = []
        line_length = 0
        
        while i < len(words):
            word_length = len(words[i])
            spaces_needed = len(line_words)
            
            if line_length + word_length + spaces_needed > max_width:
                break
            
            line_words.append(words[i])
            line_length += word_length
            i += 1
        
        # Build the line
        # Last line or single word line - left justify
        if i == len(words) or len(line_words) == 1:
            line = ' '.join(line_words)
            line += ' ' * (max_width - len(line))
        else:
            # Middle lines - full justify
            total_spaces = max_width - line_length
            gaps = len(line_words) - 1
            spaces_per_gap = total_spaces // gaps
            extra_spaces = total_spaces % gaps
            
            line = ''
            for j in range(len(line_words)):
                line += line_words[j]
                
                if j < gaps:
                    # Add base spaces
                    line += ' ' * spaces_per_gap
                    # Add extra space to leftmost gaps
                    if j < extra_spaces:
                        line += ' '
        
        result.append(line)
    
    return result

# Test cases
print(full_justify(["This", "is", "an", "example", "of", "text", "justification."], 16))
print(full_justify(["What","must","be","acknowledgment","shall","be"], 16))

*/
