# 🎯 Software Engineering Interview Preparation

A comprehensive repository for interview prep: **DSA**, **System Design**, **SQL**, and **Machine Coding**.

## 📂 Repository Structure
- **[solutions/](./solutions/)** — LeetCode solutions (JS + Python) organized by difficulty
- **[SQL/](./SQL/)** — SQL interview questions with solutions
- **[System Design/](./System%20Design/)** — System design case studies for interviews
- **[Machine Coding/](./Machine%20Coding/)** — Frontend/full-stack machine coding rounds
- **[DSA/](./DSA/)** — DSA cheat sheet, sorting algorithms, patterns
- **[Design Patterns/](./Design%20Patterns/)** — 12 design patterns with JS/Python/Java code
- **[DevOps Notes/](./General%20Tech/DevOps/)** — Linux, Docker, CI/CD, Terraform, AWS, Monitoring, Security
- **[Kubernetes Notes/](./General%20Tech/Kubernetes/)** — Core concepts, Networking, Storage, Scaling, Helm, GitOps
- **[General Tech/](./General%20Tech/README.md)** — Unified index for DevOps and Kubernetes tracks
- **[ROADMAP.md](./ROADMAP.md)** — Practical 12-week study plan for DSA + system design + machine coding
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Content and formatting guidelines for future updates
- **[TRACKER.md](./TRACKER.md)** — Weekly and daily execution tracker
- **[MISTAKE_LOG.md](./MISTAKE_LOG.md)** — Error patterns and spaced-repetition revisit log
- **[MOCK_SCORECARD.md](./MOCK_SCORECARD.md)** — Scoring rubric for DSA, machine coding, and design mocks

## 🚀 How to use this repo

1. Start with `DSA/cheat-sheet.md` and solve 3-5 problems daily by pattern.
2. Follow `ROADMAP.md` week by week for structured prep.
3. Practice one machine-coding prompt + one system-design case study every weekend.
4. Before interviews, revise `Design Patterns/`, `SQL/`, and `General Tech/` quick notes.

## 🧪 Repo hygiene checks

Run this dry-run validator to catch broken internal markdown links:

```bash
python3 tools/validate_markdown_links.py
```

---

## 🧠 Quick Pattern Recognition Guide

| If the problem says... | Think about... |
|---|---|
| Sorted array | Binary Search, Two Pointers |
| All permutations/subsets | Backtracking |
| Tree | DFS, BFS |
| Graph | DFS, BFS, Union-Find |
| Linked list | Two Pointers, Fast/Slow |
| Recursion banned | Stack |
| In-place | Swap, Store multiple values per pointer |
| Max/min subarray/subset | Dynamic Programming |
| Top/least K items | Heap, QuickSelect |
| Common strings | HashMap, Trie |
| Optimize space | Bit Manipulation, Greedy |
| String patterns | Rolling Hash, Sliding Window |

### Complexity Guide (by constraint `n`)
| n | Target Complexity |
|---|---|
| n ≤ 12 | O(n!) |
| n ≤ 25 | O(2^n) |
| n ≤ 500 | O(n³) |
| n ≤ 10⁴ | O(n²) |
| n ≤ 10⁶ | O(n log n) |
| n ≤ 10⁸ | O(n) |
| n > 10⁸ | O(log n) or O(1) |

---

## LeetCode Top 150 Interview Problems

### Array & String (25 problems)
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Two Sum](https://leetcode.com/problems/two-sum/) | [Two Sum](./solutions/easy/two-sum.js) |
| 2 | [Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/) | [Merge Sorted Array](./solutions/easy/merge-sorted-array.js) |
| 3 | [Remove Element](https://leetcode.com/problems/remove-element/) | [Remove Element](./solutions/easy/remove-element.js) |
| 4 | [Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) | [Remove Duplicates](./solutions/easy/remove-duplicates-from-sorted-array.js) |
| 5 | [Remove Duplicates from Sorted Array II](https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/) | [Remove Duplicates II](./solutions/medium/remove-duplicates-from-sorted-array-ii.js) |
| 6 | [Majority Element](https://leetcode.com/problems/majority-element/) | [Majority Element](./solutions/easy/majority-element.js) |
| 7 | [Rotate Array](https://leetcode.com/problems/rotate-array/) | [Rotate Array](./solutions/medium/rotate-array.js) |
| 8 | [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | [Stock I](./solutions/easy/best-time-to-buy-and-sell-stock.js) |
| 9 | [Best Time to Buy and Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/) | [Stock II](./solutions/medium/best-time-to-buy-and-sell-stock-ii.js) |
| 10 | [Jump Game](https://leetcode.com/problems/jump-game/) | [Jump Game](./solutions/medium/jump-game.js) |
| 11 | [Jump Game II](https://leetcode.com/problems/jump-game-ii/) | [Jump Game II](./solutions/medium/jump-game-ii.js) |
| 12 | [H-Index](https://leetcode.com/problems/h-index/) | [H-Index](./solutions/medium/h-index.js) |
| 13 | [Insert Delete GetRandom O(1)](https://leetcode.com/problems/insert-delete-getrandom-o1/) | [RandomizedSet](./solutions/medium/insert-delete-getrandom-o1.js) |
| 14 | [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) | [Product Except Self](./solutions/medium/product-of-array-except-self.js) |
| 15 | [Gas Station](https://leetcode.com/problems/gas-station/) | [Gas Station](./solutions/medium/gas-station.js) |
| 16 | [Candy](https://leetcode.com/problems/candy/) | [Candy](./solutions/hard/candy.js) |
| 17 | [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) | [Trapping Rain Water](./solutions/hard/trapping-rain-water.js) |
| 18 | [Roman to Integer](https://leetcode.com/problems/roman-to-integer/) | [Roman to Integer](./solutions/easy/roman-to-integer.js) |
| 19 | [Integer to Roman](https://leetcode.com/problems/integer-to-roman/) | [Integer to Roman](./solutions/medium/integer-to-roman.js) |
| 20 | [Length of Last Word](https://leetcode.com/problems/length-of-last-word/) | [Length of Last Word](./solutions/easy/length-of-last-word.js) |
| 21 | [Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/) | [Longest Common Prefix](./solutions/easy/longest-common-prefix.js) |
| 22 | [Reverse Words in a String](https://leetcode.com/problems/reverse-words-in-a-string/) | [Reverse Words](./solutions/medium/reverse-words-in-a-string.js) |
| 23 | [Zigzag Conversion](https://leetcode.com/problems/zigzag-conversion/) | [Zigzag Conversion](./solutions/medium/zigzag-conversion.js) |
| 24 | [Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) | [Find First Occurrence](./solutions/easy/find-index-of-first-occurrence.js) |
| 25 | [Text Justification](https://leetcode.com/problems/text-justification/) | [Text Justification](./solutions/hard/text-justification.js) |

### Two Pointers (5 problems)
| # | Problem | Solution |
|---|---------|----------|
| 26 | [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) | [Valid Palindrome](./solutions/easy/valid-palindrome.js) |
| 27 | [Is Subsequence](https://leetcode.com/problems/is-subsequence/) | [Is Subsequence](./solutions/easy/is-subsequence.js) |
| 28 | [Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) | [Two Sum II](./solutions/medium/two-sum-ii.js) |
| 29 | [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) | [Container With Most Water](./solutions/medium/container-with-most-water.js) |
| 30 | [3Sum](https://leetcode.com/problems/3sum/) | [3sum](./solutions/medium/3sum.js) |

### Sliding Window (4 problems)
| # | Problem | Solution |
|---|---------|----------|
| 31 | [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/) | [Min Subarray Sum](./solutions/medium/minimum-size-subarray-sum.js) |
| 32 | [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) | [Longest Substring](./solutions/medium/longest-substring-without-repeating-characters.js) |
| 33 | [Substring with Concatenation of All Words](https://leetcode.com/problems/substring-with-concatenation-of-all-words/) | [Substring Concatenation](./solutions/hard/substring-with-concatenation-of-all-words.js) |
| 34 | [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) | [Min Window Substring](./solutions/hard/minimum-window-substring.js) |

### Matrix (5 problems)
| # | Problem | Solution |
|---|---------|----------|
| 35 | [Valid Sudoku](https://leetcode.com/problems/valid-sudoku/) | [Valid Sudoku](./solutions/medium/valid-sudoku.js) |
| 36 | [Spiral Matrix](https://leetcode.com/problems/spiral-matrix/) | [Spiral Matrix](./solutions/medium/spiral-matrix.js) |
| 37 | [Rotate Image](https://leetcode.com/problems/rotate-image/) | [Rotate Image](./solutions/medium/rotate-image.js) |
| 38 | [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/) | [Set Matrix Zeroes](./solutions/medium/set-matrix-zeroes.js) |
| 39 | [Game of Life](https://leetcode.com/problems/game-of-life/) | [Game of Life](./solutions/medium/game-of-life.js) |

### HashMap (9 problems)
| # | Problem | Solution |
|---|---------|----------|
| 40 | [Ransom Note](https://leetcode.com/problems/ransom-note/) | [Ransom Note](./solutions/easy/ransom-note.js) |
| 41 | [Isomorphic Strings](https://leetcode.com/problems/isomorphic-strings/) | [Isomorphic Strings](./solutions/easy/isomorphic-strings.js) |
| 42 | [Word Pattern](https://leetcode.com/problems/word-pattern/) | [Word Pattern](./solutions/easy/word-pattern.js) |
| 43 | [Valid Anagram](https://leetcode.com/problems/valid-anagram/) | [Valid Anagram](./solutions/easy/valid-anagram.js) |
| 44 | [Group Anagrams](https://leetcode.com/problems/group-anagrams/) | [Group Anagrams](./solutions/medium/group-anagrams.js) |
| 45 | [Two Sum](https://leetcode.com/problems/two-sum/) | [Two Sum](./solutions/easy/two-sum.js) |
| 46 | [Happy Number](https://leetcode.com/problems/happy-number/) | [Happy Number](./solutions/easy/happy-number.js) |
| 47 | [Contains Duplicate II](https://leetcode.com/problems/contains-duplicate-ii/) | [Contains Duplicate II](./solutions/easy/contains-duplicate-ii.js) |
| 48 | [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) | [Longest Consecutive](./solutions/medium/longest-consecutive-sequence.js) |

### Intervals (4 problems)
| # | Problem | Solution |
|---|---------|----------|
| 49 | [Summary Ranges](https://leetcode.com/problems/summary-ranges/) | [Summary Ranges](./solutions/easy/summary-ranges.js) |
| 50 | [Merge Intervals](https://leetcode.com/problems/merge-intervals/) | [Merge Intervals](./solutions/medium/merge-intervals.js) |
| 51 | [Insert Interval](https://leetcode.com/problems/insert-interval/) | [Insert Interval](./solutions/medium/insert-interval.js) |
| 52 | [Minimum Number of Arrows to Burst Balloons](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/) | [Min Arrows](./solutions/medium/minimum-number-of-arrows-to-burst-balloons.js) |

### Stack (5 problems)
| # | Problem | Solution |
|---|---------|----------|
| 53 | [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) | [Valid Parentheses](./solutions/easy/valid-parentheses.js) |
| 54 | [Simplify Path](https://leetcode.com/problems/simplify-path/) | [Simplify Path](./solutions/medium/simplify-path.py) |
| 55 | [Min Stack](https://leetcode.com/problems/min-stack/) | [Min Stack](./solutions/medium/min-stack.js) |
| 56 | [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/) | [Evaluate RPN](./solutions/medium/evaluate-reverse-polish-notation.js) |
| 57 | [Basic Calculator](https://leetcode.com/problems/basic-calculator/) | [Basic Calculator](./solutions/hard/basic-calculator.py) |

### Linked List (11 problems)
| # | Problem | Solution |
|---|---------|----------|
| 58 | [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) | [Linked List Cycle](./solutions/easy/linked-lists/linked-list-cycle.js) |
| 59 | [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) | [Add Two Numbers](./solutions/medium/linked-lists/add-two-numbers.js) |
| 60 | [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) | [Merge Two Sorted Lists](./solutions/easy/linked-lists/merge-two-sorted-lists.js) |
| 61 | [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) | [Copy List](./solutions/medium/linked-lists/copy-list-with-random-pointer.js) |
| 62 | [Reverse Linked List II](https://leetcode.com/problems/reverse-linked-list-ii/) | [Reverse Linked List II](./solutions/medium/linked-lists/reverse-linked-list-ii.js) |
| 63 | [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/) | [Reverse Nodes in k-Group](./solutions/hard/reverse-nodes-in-k-group.js) |
| 64 | [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) | [Remove Nth](./solutions/medium/linked-lists/remove-nth-node-from-end-of-list.js) |
| 65 | [Remove Duplicates from Sorted List II](https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/) | [Remove Duplicates Sorted List II](./solutions/medium/linked-lists/remove-duplicates-from-sorted-list-ii.js) |
| 66 | [Rotate List](https://leetcode.com/problems/rotate-list/) | [Rotate List](./solutions/medium/linked-lists/rotate-list.js) |
| 67 | [Partition List](https://leetcode.com/problems/partition-list/) | [Partition List](./solutions/medium/linked-lists/partition-list.js) |
| 68 | [LRU Cache](https://leetcode.com/problems/lru-cache/) | [LRU Cache](./solutions/medium/linked-lists/lru-cache.py) |

### Binary Tree General (14 problems)
| # | Problem | Solution |
|---|---------|----------|
| 69 | [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) | [Max Depth](./solutions/easy/trees/maximum-depth-of-binary-tree.js) |
| 70 | [Same Tree](https://leetcode.com/problems/same-tree/) | [Same Tree](./solutions/easy/trees/same-tree.js) |
| 71 | [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) | [Invert Binary Tree](./solutions/easy/trees/invert-binary-tree.js) |
| 72 | [Symmetric Tree](https://leetcode.com/problems/symmetric-tree/) | [Symmetric Tree](./solutions/easy/trees/symmetric-tree.js) |
| 73 | [Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | [Construct Pre+In](./solutions/medium/construct-binary-tree-from-preorder-and-inorder.js) |
| 74 | [Construct Binary Tree from Inorder and Postorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/) | [Construct In+Post](./solutions/medium/construct-binary-tree-from-inorder-and-postorder.js) |
| 75 | [Populating Next Right Pointers in Each Node II](https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/) | [Next Right II](./solutions/medium/populating-next-right-pointers-ii.js) |
| 76 | [Flatten Binary Tree to Linked List](https://leetcode.com/problems/flatten-binary-tree-to-linked-list/) | [Flatten BT](./solutions/medium/flatten-binary-tree-to-linked-list.js) |
| 77 | [Path Sum](https://leetcode.com/problems/path-sum/) | [Path Sum](./solutions/easy/trees/path-sum.js) |
| 78 | [Sum Root to Leaf Numbers](https://leetcode.com/problems/sum-root-to-leaf-numbers/) | [Sum Root to Leaf](./solutions/medium/sum-root-to-leaf-numbers.js) |
| 79 | [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/) | [Max Path Sum](./solutions/hard/binary-tree-maximum-path-sum.js) |
| 80 | [Binary Search Tree Iterator](https://leetcode.com/problems/binary-search-tree-iterator/) | [BST Iterator](./solutions/medium/binary-search-tree-iterator.js) |
| 81 | [Count Complete Tree Nodes](https://leetcode.com/problems/count-complete-tree-nodes/) | [Count Nodes](./solutions/medium/count-complete-tree-nodes.js) |
| 82 | [Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) | [LCA of BT](./solutions/medium/lowest-common-ancestor-bt.js) |

### Binary Tree BFS (4 problems)
| # | Problem | Solution |
|---|---------|----------|
| 83 | [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/) | [Right Side View](./solutions/medium/binary-tree-right-side-view.js) |
| 84 | [Average of Levels in Binary Tree](https://leetcode.com/problems/average-of-levels-in-binary-tree/) | [Average of Levels](./solutions/easy/average-of-levels-in-binary-tree.js) |
| 85 | [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) | [Level Order](./solutions/medium/trees/binary-tree-level-order-traversal.js) |
| 86 | [Binary Tree Zigzag Level Order Traversal](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/) | [Zigzag Level Order](./solutions/medium/binary-tree-zigzag-level-order-traversal.js) |

### Binary Search Tree (3 problems)
| # | Problem | Solution |
|---|---------|----------|
| 87 | [Minimum Absolute Difference in BST](https://leetcode.com/problems/minimum-absolute-difference-in-bst/) | [Min Abs Diff BST](./solutions/medium/trees/minimum-absolute-difference-in-bst.js) |
| 88 | [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) | [Kth Smallest BST](./solutions/medium/trees/kth-smallest-element-in-a-bst.js) |
| 89 | [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) | [Validate BST](./solutions/medium/trees/validate-binary-search-tree.js) |

### Graph General (6 problems)
| # | Problem | Solution |
|---|---------|----------|
| 90 | [Number of Islands](https://leetcode.com/problems/number-of-islands/) | [Number of Islands](./solutions/medium/number-of-islands.js) |
| 91 | [Surrounded Regions](https://leetcode.com/problems/surrounded-regions/) | [Surrounded Regions](./solutions/medium/surrounded-regions.js) |
| 92 | [Clone Graph](https://leetcode.com/problems/clone-graph/) | [Clone Graph](./solutions/medium/clone-graph.js) |
| 93 | [Evaluate Division](https://leetcode.com/problems/evaluate-division/) | [Evaluate Division](./solutions/medium/evaluate-division.js) |
| 94 | [Course Schedule](https://leetcode.com/problems/course-schedule/) | [Course Schedule](./solutions/medium/course-schedule.js) |
| 95 | [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) | [Course Schedule II](./solutions/medium/course-schedule-ii.js) |

### Graph BFS (3 problems)
| # | Problem | Solution |
|---|---------|----------|
| 96 | [Snakes and Ladders](https://leetcode.com/problems/snakes-and-ladders/) | [Snakes and Ladders](./solutions/medium/snakes-and-ladders.js) |
| 97 | [Minimum Genetic Mutation](https://leetcode.com/problems/minimum-genetic-mutation/) | [Genetic Mutation](./solutions/medium/minimum-genetic-mutation.js) |
| 98 | [Word Ladder](https://leetcode.com/problems/word-ladder/) | [Word Ladder](./solutions/hard/word-ladder.js) |

### Trie (3 problems)
| # | Problem | Solution |
|---|---------|----------|
| 99 | [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/) | [Implement Trie](./solutions/medium/tries/implement-trie-prefix-tree.js) |
| 100 | [Design Add and Search Words Data Structure](https://leetcode.com/problems/design-add-and-search-words-data-structure/) | [Design Add Search](./solutions/medium/tries/design-add-and-search-words-data-structure.js) |
| 101 | [Word Search II](https://leetcode.com/problems/word-search-ii/) | [Word Search II](./solutions/medium/tries/word-search-ii.js) |

### Backtracking (7 problems)
| # | Problem | Solution |
|---|---------|----------|
| 102 | [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) | [Letter Combinations](./solutions/medium/letter-combinations-of-a-phone-number.js) |
| 103 | [Combinations](https://leetcode.com/problems/combinations/) | [Combinations](./solutions/medium/combinations.js) |
| 104 | [Permutations](https://leetcode.com/problems/permutations/) | [Permutations](./solutions/medium/permutations.js) |
| 105 | [Combination Sum](https://leetcode.com/problems/combination-sum/) | [Combination Sum](./solutions/medium/combination-sum.js) |
| 106 | [N-Queens II](https://leetcode.com/problems/n-queens-ii/) | [N-Queens](./solutions/hard/n-queens.js) |
| 107 | [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) | [Generate Parentheses](./solutions/medium/generate-parentheses.js) |
| 108 | [Word Search](https://leetcode.com/problems/word-search/) | [Word Search](./solutions/medium/word-search.js) |

### Divide & Conquer (4 problems)
| # | Problem | Solution |
|---|---------|----------|
| 109 | [Convert Sorted Array to Binary Search Tree](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/) | [Convert Sorted Array to BST](./solutions/easy/trees/convert-sorted-array-to-binary-search-tree.js) |
| 110 | [Sort List](https://leetcode.com/problems/sort-list/) | [Sort List](./solutions/medium/sort-list.js) |
| 111 | [Construct Quad Tree](https://leetcode.com/problems/construct-quad-tree/) | [Construct Quad Tree](./solutions/medium/construct-quad-tree.js) |
| 112 | [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) | [Merge k Sorted Lists](./solutions/hard/merge-k-sorted-lists.js) |

### Kadane's Algorithm (2 problems)
| # | Problem | Solution |
|---|---------|----------|
| 113 | [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) | [Maximum Subarray](./solutions/medium/maximum-subarray.py) |
| 114 | [Maximum Sum Circular Subarray](https://leetcode.com/problems/maximum-sum-circular-subarray/) | [Max Sum Circular](./solutions/medium/maximum-sum-circular-subarray.js) |

### Binary Search (7 problems)
| # | Problem | Solution |
|---|---------|----------|
| 115 | [Search Insert Position](https://leetcode.com/problems/search-insert-position/) | [Search Insert Position](./solutions/easy/search-insert-position.js) |
| 116 | [Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/) | [Search 2D Matrix](./solutions/medium/search-a-2d-matrix.js) |
| 117 | [Find Peak Element](https://leetcode.com/problems/find-peak-element/) | [Find Peak](./solutions/medium/find-peak-element.js) |
| 118 | [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | [Search Rotated](./solutions/medium/search-in-rotated-sorted-array.js) |
| 119 | [Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) | [Find First Last](./solutions/medium/find-first-and-last-position-of-element-in-sorted-array.js) |
| 120 | [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | [Find Min Rotated](./solutions/medium/find-minimum-in-rotated-sorted-array.js) |
| 121 | [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) | [Median of Two Sorted Arrays](./solutions/hard/median-of-two-sorted-arrays.js) |

### Heap (4 problems)
| # | Problem | Solution |
|---|---------|----------|
| 122 | [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) | [Kth Largest Element](./solutions/medium/kth-largest-element-in-an-array.js) |
| 123 | [IPO](https://leetcode.com/problems/ipo/) | [IPO](./solutions/hard/ipo.js) |
| 124 | [Find K Pairs with Smallest Sums](https://leetcode.com/problems/find-k-pairs-with-smallest-sums/) | [Find K Pairs](./solutions/hard/find-k-pairs-with-smallest-sums.js) |
| 125 | [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) | [Find Median](./solutions/hard/find-median-from-data-stream.js) |

### Bit Manipulation (6 problems)
| # | Problem | Solution |
|---|---------|----------|
| 126 | [Add Binary](https://leetcode.com/problems/add-binary/) | [Add Binary](./solutions/easy/add-binary.js) |
| 127 | [Reverse Bits](https://leetcode.com/problems/reverse-bits/) | [Reverse Bits](./solutions/easy/reverse-bits.js) |
| 128 | [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/) | [Number of 1 Bits](./solutions/easy/number-of-1-bits.js) |
| 129 | [Single Number](https://leetcode.com/problems/single-number/) | [Single Number](./solutions/easy/single-number.js) |
| 130 | [Single Number II](https://leetcode.com/problems/single-number-ii/) | [Single Number II](./solutions/medium/single-number-ii.js) |
| 131 | [Bitwise AND of Numbers Range](https://leetcode.com/problems/bitwise-and-of-numbers-range/) | [Bitwise AND Range](./solutions/medium/bitwise-and-of-numbers-range.js) |

### Math (6 problems)
| # | Problem | Solution |
|---|---------|----------|
| 132 | [Palindrome Number](https://leetcode.com/problems/palindrome-number/) | [Palindrome Number](./solutions/easy/palindrome-number.js) |
| 133 | [Plus One](https://leetcode.com/problems/plus-one/) | [Plus One](./solutions/easy/plus-one.js) |
| 134 | [Factorial Trailing Zeroes](https://leetcode.com/problems/factorial-trailing-zeroes/) | [Factorial Trailing Zeroes](./solutions/easy/factorial-trailing-zeroes.js) |
| 135 | [Sqrt(x)](https://leetcode.com/problems/sqrtx/) | [Sqrt(x)](./solutions/easy/sqrtx.js) |
| 136 | [Pow(x, n)](https://leetcode.com/problems/powx-n/) | [Pow(x, n)](./solutions/medium/powx-n.js) |
| 137 | [Max Points on a Line](https://leetcode.com/problems/max-points-on-a-line/) | [Max Points on a Line](./solutions/hard/max-points-on-a-line.py) |

### 1D Dynamic Programming (5 problems)
| # | Problem | Solution |
|---|---------|----------|
| 138 | [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) | [Climbing Stairs](./solutions/medium/dp/climbing-stairs.js) |
| 139 | [House Robber](https://leetcode.com/problems/house-robber/) | [House Robber](./solutions/medium/dp/house-robber.js) |
| 140 | [Word Break](https://leetcode.com/problems/word-break/) | [Word Break](./solutions/medium/dp/word-break.js) |
| 141 | [Coin Change](https://leetcode.com/problems/coin-change/) | [Coin Change](./solutions/medium/dp/coin-change.js) |
| 142 | [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) | [LIS](./solutions/medium/longest-increasing-subsequence.js) |

### Multidimensional DP (8 problems)
| # | Problem | Solution |
|---|---------|----------|
| 143 | [Triangle](https://leetcode.com/problems/triangle/) | [Triangle](./solutions/medium/dp/triangle.js) |
| 144 | [Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/) | [Minimum Path Sum](./solutions/medium/dp/minimum-path-sum.js) |
| 145 | [Unique Paths II](https://leetcode.com/problems/unique-paths-ii/) | [Unique Paths II](./solutions/medium/dp/unique-paths-ii.js) |
| 146 | [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/) | [Longest Palindromic Substring](./solutions/medium/longest-palindromic-substring.js) |
| 147 | [Interleaving String](https://leetcode.com/problems/interleaving-string/) | [Interleaving String](./solutions/medium/interleaving-string.js) |
| 148 | [Edit Distance](https://leetcode.com/problems/edit-distance/) | [Edit Distance](./solutions/hard/edit-distance.js) |
| 149 | [Best Time to Buy and Sell Stock III](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/) | [Stock III](./solutions/hard/best-time-to-buy-and-sell-stock-iii.js) |
| 150 | [Best Time to Buy and Sell Stock IV](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/) | [Stock IV](./solutions/hard/best-time-to-buy-and-sell-stock-iv.js) |




---

## 🔥 Frequently Asked Questions (DE/FAANG Rounds)

### ➤ Data Engineering Round Problems
| # | Problem | Pattern | Solution |
|---|---------|---------|---------|
| 1 | Top-K Active Users (Last 1 Hour) — Stream | Heap + Sliding Window | [JS](./solutions/misc/frequently-asked-questions/de-problem1-top-k-active-users.js) / [Py](./solutions/misc/frequently-asked-questions/de-problem1-top-k-active-users.py) |
| 2 | Order Reconciliation — Two Systems | HashMap + Set Operations | [JS](./solutions/misc/frequently-asked-questions/de-problem2-order-reconciliation.js) / [Py](./solutions/misc/frequently-asked-questions/de-problem2-order-reconciliation.py) |
| 3 | Session Grouping + Revenue — 30-min Inactivity | Sorting + Interval Merging | [JS](./solutions/misc/frequently-asked-questions/de-problem3-session-revenue.js) / [Py](./solutions/misc/frequently-asked-questions/de-problem3-session-revenue.py) |

### ➤ Classic Must-Know Problems
| # | Problem | LC | Pattern | Solution |
|---|---------|-----|---------|---------|
| 1 | LRU Cache + LFU Cache | 146 / 460 | HashMap + DLL / Freq Map | [JS](./solutions/misc/frequently-asked-questions/lru-lfu-cache.js) / [Py](./solutions/misc/frequently-asked-questions/lru-lfu-cache.py) |
| 2 | Find Median from Data Stream | 295 | Two Heaps | [JS](./solutions/misc/frequently-asked-questions/find-median-from-data-stream.js) / [Py](./solutions/misc/frequently-asked-questions/find-median-from-data-stream.py) |
| 3 | Word Ladder | 127 | BFS + Wildcard Preprocessing | [JS](./solutions/misc/frequently-asked-questions/word-ladder.js) / [Py](./solutions/misc/frequently-asked-questions/word-ladder.py) |
| 4 | Merge K Sorted Lists | 23 | Min-Heap | [JS](./solutions/misc/frequently-asked-questions/merge-k-sorted-lists.js) / [Py](./solutions/misc/frequently-asked-questions/merge-k-sorted-lists.py) |
| 5 | Detect Cycle in Directed Graph | — | DFS 3-color / Kahn's BFS | [JS](./solutions/misc/frequently-asked-questions/detect-cycle-directed-graph.js) / [Py](./solutions/misc/frequently-asked-questions/detect-cycle-directed-graph.py) |
| 6 | Maximum Subarray Sum (Kadane's) | 53 | Kadane's / Greedy DP | [JS](./solutions/misc/frequently-asked-questions/maximum-subarray-sum.js) / [Py](./solutions/misc/frequently-asked-questions/maximum-subarray-sum.py) |
| 7 | Kth Largest Element in a Stream | 703 | Min-Heap of Size K | [JS](./solutions/misc/frequently-asked-questions/kth-largest-in-stream.js) / [Py](./solutions/misc/frequently-asked-questions/kth-largest-in-stream.py) |
| 8 | Task Scheduler | 621 | Greedy + Max-Heap | [JS](./solutions/misc/frequently-asked-questions/task-scheduler.js) / [Py](./solutions/misc/frequently-asked-questions/task-scheduler.py) |

### ➤ Pattern Batches (JS + Python)
| Pattern | LeetCode Numbers | Solution File |
|---------|-----------------|---------------|
| Sliding Window | 76, 209, 424, 567, 904 | [JS](./solutions/misc/frequently-asked-questions/sliding-window-problems.js) / [Py](./solutions/misc/frequently-asked-questions/sliding-window-problems.py) |
| Two Pointers | 11, 15, 26, 42, 75, 88 | [JS](./solutions/misc/frequently-asked-questions/two-pointers-problems.js) / [Py](./solutions/misc/frequently-asked-questions/two-pointers-problems.py) |
| Binary Search | 33, 153, 162, 704 | [JS](./solutions/misc/frequently-asked-questions/binary-search-problems.js) / [Py](./solutions/misc/frequently-asked-questions/binary-search-problems.py) |
| BFS | 102, 200, 994, 542, 286, 815 | [JS](./solutions/misc/frequently-asked-questions/bfs-problems.js) / [Py](./solutions/misc/frequently-asked-questions/bfs-problems.py) |
| Backtracking | 39, 46, 51, 78, 79 | [JS](./solutions/misc/frequently-asked-questions/backtracking-problems.js) / [Py](./solutions/misc/frequently-asked-questions/backtracking-problems.py) |
| Dynamic Programming | 70, 198, 300, 322, 1143, 416 | [JS](./solutions/misc/frequently-asked-questions/dynamic-programming-problems.js) / [Py](./solutions/misc/frequently-asked-questions/dynamic-programming-problems.py) |

---

## 📖 Quick Reference Links
- **[SQL Questions & Answers](./SQL/README.md)**
- **[System Design Index](./System%20Design/README.md)**
- **[System Design Case Studies](./System%20Design/Case_Studies.md)**
- **[System Design Interview Template](./System%20Design/_interview-template.md)**
- **[Machine Coding Index](./Machine%20Coding/README.md)**
- **[Machine Coding Questions](./Machine%20Coding/Questions.md)**
- **[Machine Coding Evaluation Rubric](./Machine%20Coding/_evaluation-rubric.md)**
- **[DSA Cheat Sheet & Patterns](./DSA/cheat-sheet.md)**
- **[DSA Index](./DSA/README.md)**
- **[Sorting & Searching Algorithms](./DSA/sorting-algorithms.md)**
- **[Solutions Directory Guide](./solutions/README.md)**
- **[Design Patterns](./Design%20Patterns/README.md)**
- **[DevOps Interview Notes](./General%20Tech/DevOps/README.md)**
- **[Kubernetes Interview Notes](./General%20Tech/Kubernetes/README.md)**
