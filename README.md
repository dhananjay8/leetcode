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

## Final 200 - Easy
| Number | Problem Name | Solution |
|--------|--------------|----------|
| 1      | [Two Sum](https://leetcode.com/problems/two-sum/) | [Two Sum](./solutions/easy/two-sum.js) |
| 2      | [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) | [Valid Palindrome](./solutions/easy/valid-palindrome.js) |
| 3      | [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) | [Valid Parentheses](./solutions/easy/valid-parentheses.js) |
| 4      | [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) | [Merge Two Sorted Lists](./solutions/easy/linked-lists/merge-two-sorted-lists.js) |
| 5      | [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) | [Reverse Linked List](./solutions/easy/linked-lists/reverse-linked-list.js) |
| 6      | [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) | [Linked List Cycle](./solutions/easy/linked-lists/linked-list-cycle.js) |
| 7      | [Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list) | [Middle of the Linked List](./solutions/easy/linked-lists/middle-of-the-linked-list.js) |
| 8      | [Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/) | [Palindrome Linked List](./solutions/easy/linked-lists/palindrome-linked-list.js) |
| 9      | [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) | [Invert Binary Tree](./solutions/easy/trees/invert-binary-tree.js) |
| 10     | [Same Tree](https://leetcode.com/problems/same-tree/) | [Same Tree](./solutions/easy/trees/same-tree.js) |
| 11     | [Symmetric Tree](https://leetcode.com/problems/symmetric-tree/) | [Symmetric Tree](./solutions/easy/trees/symmetric-tree.js) |
| 12     | [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) | [Maximum Depth of Binary Tree](./solutions/easy/trees/maximum-depth-of-binary-tree.js) |
| 13     | [Valid Anagram](https://leetcode.com/problems/valid-anagram/) | [Valid Anagram](./solutions/easy/valid-anagram.js) |
| 14     | [Ransom Note](https://leetcode.com/problems/ransom-note/) | [Ransom Note](./solutions/easy/ransom-note.js) |
| 15     | [Isomorphic Strings](https://leetcode.com/problems/isomorphic-strings/) | [Isomorphic Strings](./solutions/easy/isomorphic-strings.js) |
| 16     | [Contains Duplicate II](https://leetcode.com/problems/contains-duplicate-ii/) | [Contains Duplicate II](./solutions/easy/contains-duplicate-ii.js) |
| 17     | [Happy Number](https://leetcode.com/problems/happy-number/) | [Happy Number](./solutions/easy/happy-number.js) |
| 18     | [Word Pattern](https://leetcode.com/problems/word-pattern/) | [Word Pattern](./solutions/easy/word-pattern.js) |
| 19     | [Summary Ranges](https://leetcode.com/problems/summary-ranges/) | [Summary Ranges](./solutions/easy/summary-ranges.js) |
| 20     | [Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) | [Remove Duplicates](./solutions/easy/remove-duplicates-from-sorted-array.js) |
| 21     | [Remove Element](https://leetcode.com/problems/remove-element/) | [Remove Element](./solutions/easy/remove-element.js) |
| 22     | [Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/) | [Merge Sorted Array](./solutions/easy/merge-sorted-array.js) |
| 23     | [Majority Element](https://leetcode.com/problems/majority-element/) | [Majority Element](./solutions/easy/majority-element.js) |
| 24     | [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | [Stock I](./solutions/easy/best-time-to-buy-and-sell-stock.js) |
| 25     | [Best Time to Buy and Sell Stock II](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/) | [Stock II](./solutions/medium/best-time-to-buy-and-sell-stock-ii.js) |
| 26     | [Is Subsequence](https://leetcode.com/problems/is-subsequence/) | [Is Subsequence](./solutions/easy/is-subsequence.js) |
| 27     | [Plus One](https://leetcode.com/problems/plus-one/) | [Plus One](./solutions/easy/plus-one.js) |
| 28     | [Palindrome Number](https://leetcode.com/problems/palindrome-number/) | [Palindrome Number](./solutions/easy/palindrome-number.js) |
| 29     | [Single Number](https://leetcode.com/problems/single-number/) | [Single Number](./solutions/easy/single-number.js) |
| 30     | [Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/) | [Longest Common Prefix](./solutions/easy/longest-common-prefix.js) |
| 31     | [Length of Last Word](https://leetcode.com/problems/length-of-last-word/) | [Length of Last Word](./solutions/easy/length-of-last-word.js) |
| 32     | [Sqrt(x)](https://leetcode.com/problems/sqrtx/) | [Sqrt(x)](./solutions/easy/sqrtx.js) |
| 33     | [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/) | [Number of 1 Bits](./solutions/easy/number-of-1-bits.js) |
| 34     | [Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) | [Find First Occurrence](./solutions/easy/find-index-of-first-occurrence.js) |
| 35     | [Reverse Bits](https://leetcode.com/problems/reverse-bits/) | [Reverse Bits](./solutions/easy/reverse-bits.js) |
| 36     | [Add Binary](https://leetcode.com/problems/add-binary/) | [Add Binary](./solutions/easy/add-binary.js) |
| 37     | [Search Insert Position](https://leetcode.com/problems/search-insert-position/) | [Search Insert Position](./solutions/easy/search-insert-position.js) |
| 38     | [Counting Bits](https://leetcode.com/problems/counting-bits) | [Counting Bits](./solutions/easy/counting-bits.js) |
| 39     | [Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) | [Two Sum II](./solutions/medium/two-sum-ii.js) |
| 40     | [Missing Number](https://leetcode.com/problems/missing-number/) | [Missing Number](./solutions/easy/missing-number.py) |
| 41     | [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) | [Climbing Stairs](./solutions/medium/dp/climbing-stairs.js) |
| 42     | [Roman to Integer](https://leetcode.com/problems/roman-to-integer/) | [Roman to Integer](./solutions/easy/roman-to-integer.js) |
| 43     | [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) | [Contains Duplicate](./solutions/easy/contains-duplicate.js) |
| 44     | [Average of Levels in Binary Tree](https://leetcode.com/problems/average-of-levels-in-binary-tree/) | [Average of Levels](./solutions/easy/average-of-levels-in-binary-tree.js) |

## Final 200 - Medium
| Number | Problem Name | Solution |
|--------|--------------|----------|
| 1      | [3sum](https://leetcode.com/problems/3sum/) | [3sum](./solutions/medium/3sum.js) |
| 2      | [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) | [Container With Most Water](./solutions/medium/container-with-most-water.js) |
| 3      | [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) | [Remove Nth](./solutions/medium/linked-lists/remove-nth-node-from-end-of-list.js) |
| 4      | [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) | [Copy List](./solutions/medium/linked-lists/copy-list-with-random-pointer.js) |
| 5      | [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) | [Add Two Numbers](./solutions/medium/linked-lists/add-two-numbers.js) |
| 6      | [Add Two Numbers II](https://leetcode.com/problems/add-two-numbers-ii/) | [Add Two Numbers II](./solutions/medium/linked-lists/add-two-numbers-ii.js) |
| 7      | [LRU Cache](https://leetcode.com/problems/lru-cache/) | [LRU Cache](./solutions/medium/linked-lists/lru-cache.py) |
| 8      | [Lowest Common Ancestor of a Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) | [LCA of BST](./solutions/medium/lowest-common-ancestor-bst.js) |
| 9      | [Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) | [LCA of BT](./solutions/medium/lowest-common-ancestor-bt.js) |
| 10     | [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/) | [Right Side View](./solutions/medium/binary-tree-right-side-view.js) |
| 11     | [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) | [Level Order](./solutions/medium/trees/binary-tree-level-order-traversal.js) |
| 12     | [Binary Tree Zigzag Level Order Traversal](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/) | [Zigzag Level Order](./solutions/medium/binary-tree-zigzag-level-order-traversal.js) |
| 13     | [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) | [Validate BST](./solutions/medium/trees/validate-binary-search-tree.js) |
| 14     | [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) | [Kth Smallest BST](./solutions/medium/trees/kth-smallest-element-in-a-bst.js) |
| 15     | [Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | [Construct Pre+In](./solutions/medium/construct-binary-tree-from-preorder-and-inorder.js) |
| 16     | [Construct Binary Tree from Inorder and Postorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/) | [Construct In+Post](./solutions/medium/construct-binary-tree-from-inorder-and-postorder.js) |
| 17     | [Populating Next Right Pointers in Each Node II](https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/) | [Next Right II](./solutions/medium/populating-next-right-pointers-ii.js) |
| 18     | [Flatten Binary Tree to Linked List](https://leetcode.com/problems/flatten-binary-tree-to-linked-list/) | [Flatten BT](./solutions/medium/flatten-binary-tree-to-linked-list.js) |
| 19     | [Path Sum II](https://leetcode.com/problems/path-sum-ii/) | [Path Sum II](./solutions/medium/path-sum-ii.js) |
| 20     | [Sum Root to Leaf Numbers](https://leetcode.com/problems/sum-root-to-leaf-numbers/) | [Sum Root to Leaf](./solutions/medium/sum-root-to-leaf-numbers.js) |
| 21     | [Binary Search Tree Iterator](https://leetcode.com/problems/binary-search-tree-iterator/) | [BST Iterator](./solutions/medium/binary-search-tree-iterator.js) |
| 22     | [Count Complete Tree Nodes](https://leetcode.com/problems/count-complete-tree-nodes/) | [Count Nodes](./solutions/medium/count-complete-tree-nodes.js) |
| 23     | [Number of Islands](https://leetcode.com/problems/number-of-islands/) | [Number of Islands](./solutions/medium/number-of-islands.js) |
| 24     | [Surrounded Regions](https://leetcode.com/problems/surrounded-regions/) | [Surrounded Regions](./solutions/medium/surrounded-regions.js) |
| 25     | [Clone Graph](https://leetcode.com/problems/clone-graph/) | [Clone Graph](./solutions/medium/clone-graph.js) |
| 26     | [Course Schedule](https://leetcode.com/problems/course-schedule/) | [Course Schedule](./solutions/medium/course-schedule.js) |
| 27     | [Evaluate Division](https://leetcode.com/problems/evaluate-division/) | [Evaluate Division](./solutions/medium/evaluate-division.js) |
| 28     | [Coin Change](https://leetcode.com/problems/coin-change/) | [Coin Change](./solutions/medium/dp/coin-change.js) |
| 29     | [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) | [LIS](./solutions/medium/longest-increasing-subsequence.js) |
| 30     | [Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/) | [Min Cost Climbing](./solutions/medium/min-cost-climbing-stairs.js) |
| 31     | [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) | [Max Product](./solutions/medium/maximum-product-subarray.js) |
| 32     | [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/) | [Min Subarray Sum](./solutions/medium/minimum-size-subarray-sum.js) |
| 33     | [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) | [Longest Substring](./solutions/medium/longest-substring-without-repeating-characters.js) |
| 34     | [Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) | [Find First Last](./solutions/medium/find-first-and-last-position-of-element-in-sorted-array.js) |
| 35     | [Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/) | [Search 2D Matrix](./solutions/medium/search-a-2d-matrix.js) |
| 36     | [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | [Search Rotated](./solutions/medium/search-in-rotated-sorted-array.js) |
| 37     | [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | [Find Min Rotated](./solutions/medium/find-minimum-in-rotated-sorted-array.js) |
| 38     | [Find Peak Element](https://leetcode.com/problems/find-peak-element/) | [Find Peak](./solutions/medium/find-peak-element.js) |
| 39     | [Simplify Path](https://leetcode.com/problems/simplify-path/) | [Simplify Path](./solutions/medium/simplify-path.py) |
| 40     | [Min Stack](https://leetcode.com/problems/min-stack/) | [Min Stack](./solutions/medium/min-stack.js) |
| 41     | [Valid Sudoku](https://leetcode.com/problems/valid-sudoku/) | [Valid Sudoku](./solutions/medium/valid-sudoku.js) |
| 42     | [Spiral Matrix](https://leetcode.com/problems/spiral-matrix/) | [Spiral Matrix](./solutions/medium/spiral-matrix.js) |
| 43     | [Rotate Image](https://leetcode.com/problems/rotate-image/) | [Rotate Image](./solutions/medium/rotate-image.js) |
| 44     | [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/) | [Set Matrix Zeroes](./solutions/medium/set-matrix-zeroes.js) |
| 45     | [Game of Life](https://leetcode.com/problems/game-of-life/) | [Game of Life](./solutions/medium/game-of-life.js) |
| 46     | [Group Anagrams](https://leetcode.com/problems/group-anagrams/) | [Group Anagrams](./solutions/medium/group-anagrams.js) |
| 47     | [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) | [Longest Consecutive](./solutions/medium/longest-consecutive-sequence.js) |
| 48     | [4Sum](https://leetcode.com/problems/4sum/) | [4Sum](./solutions/medium/4sum.js) |
| 49     | [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) | [Product Except Self](./solutions/medium/product-of-array-except-self.js) |
| 50     | [Jump Game](https://leetcode.com/problems/jump-game/) | [Jump Game](./solutions/medium/jump-game.js) |
| 51     | [Jump Game II](https://leetcode.com/problems/jump-game-ii/) | [Jump Game II](./solutions/medium/jump-game-ii.js) |
| 52     | [H-Index](https://leetcode.com/problems/h-index/) | [H-Index](./solutions/medium/h-index.js) |
| 53     | [Insert Delete GetRandom O(1)](https://leetcode.com/problems/insert-delete-getrandom-o1/) | [RandomizedSet](./solutions/medium/insert-delete-getrandom-o1.js) |
| 54     | [Gas Station](https://leetcode.com/problems/gas-station/) | [Gas Station](./solutions/medium/gas-station.js) |
| 55     | [Candy](https://leetcode.com/problems/candy/) | [Candy](./solutions/hard/candy.js) |
| 56     | [Reverse Words in a String](https://leetcode.com/problems/reverse-words-in-a-string/) | [Reverse Words](./solutions/medium/reverse-words-in-a-string.js) |
| 57     | [Zigzag Conversion](https://leetcode.com/problems/zigzag-conversion/) | [Zigzag Conversion](./solutions/medium/zigzag-conversion.js) |
| 58     | [Minimum Number of Arrows to Burst Balloons](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/) | [Min Arrows](./solutions/medium/minimum-number-of-arrows-to-burst-balloons.js) |
| 59     | [Merge Intervals](https://leetcode.com/problems/merge-intervals/) | [Merge Intervals](./solutions/medium/merge-intervals.js) |
| 60     | [Insert Interval](https://leetcode.com/problems/insert-interval/) | [Insert Interval](./solutions/medium/insert-interval.js) |
| 61     | [Remove Duplicates from Sorted Array II](https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/) | [Remove Duplicates II](./solutions/medium/remove-duplicates-from-sorted-array-ii.js) |
| 62     | [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/) | [Evaluate RPN](./solutions/medium/evaluate-reverse-polish-notation.js) |
| 63     | [House Robber](https://leetcode.com/problems/house-robber/) | [House Robber](./solutions/medium/dp/house-robber.js) |
| 64     | [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) | [Longest Repeating](./solutions/medium/longest-repeating-character-replacement.js) |
| 65     | [String to Integer (atoi)](https://leetcode.com/problems/string-to-integer-atoi/) | [String to Integer](./solutions/medium/string-to-integer-atoi.js) |
| 66     | [Snakes and Ladders](https://leetcode.com/problems/snakes-and-ladders/) | [Snakes and Ladders](./solutions/medium/snakes-and-ladders.js) |
| 67     | [Minimum Genetic Mutation](https://leetcode.com/problems/minimum-genetic-mutation/) | [Genetic Mutation](./solutions/medium/minimum-genetic-mutation.js) |
| 68     | [Sort List](https://leetcode.com/problems/sort-list/) | [Sort List](./solutions/medium/sort-list.js) |
| 69     | [Interleaving String](https://leetcode.com/problems/interleaving-string/) | [Interleaving String](./solutions/medium/interleaving-string.js) |
| 70     | [Integer to Roman](https://leetcode.com/problems/integer-to-roman/) | [Integer to Roman](./solutions/medium/integer-to-roman.js) |
| 71     | [Count and Say](https://leetcode.com/problems/count-and-say/) | [Count and Say](./solutions/medium/count-and-say.py) |

## Final 200 - Hard
| Number | Problem Name | Solution |
|--------|--------------|----------|
| 1      | [Basic Calculator](https://leetcode.com/problems/basic-calculator/) | [Basic Calculator](./solutions/hard/basic-calculator.py) |
| 2      | [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) | [Trapping Rain Water](./solutions/hard/trapping-rain-water.js) |
| 3      | [Word Search II](https://leetcode.com/problems/word-search-ii/) | [Word Search II](./solutions/medium/tries/word-search-ii.js) |
| 4      | [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) | [Median of Two Sorted Arrays](./solutions/hard/median-of-two-sorted-arrays.js) |
| 5      | [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group) | [Reverse Nodes in k-Group](./solutions/hard/reverse-nodes-in-k-group.js) |
| 6      | [Max Points on a Line](https://leetcode.com/problems/max-points-on-a-line/) | [Max Points on a Line](./solutions/hard/max-points-on-a-line.py) |
| 7      | [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) | [Min Window Substring](./solutions/hard/minimum-window-substring.js) |
| 8      | [Text Justification](https://leetcode.com/problems/text-justification/) | [Text Justification](./solutions/hard/text-justification.js) |


## Topic-wise DSA Problems (with Solutions)

### ➤ Array Manipulation & Sorting
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Sort Colors](https://leetcode.com/problems/sort-colors/) | [Solution](./solutions/medium/sort-colors.js) |
| 2 | [Find All Duplicates in an Array](https://leetcode.com/problems/find-all-duplicates-in-an-array/) | [Solution](./solutions/medium/find-all-duplicates-in-an-array.js) |
| 3 | [Missing Number](https://leetcode.com/problems/missing-number/) | [Solution](./solutions/easy/missing-number.py) |
| 4 | [Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/) | [Solution](./solutions/medium/find-the-duplicate-number.js) |
| 5 | [Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) | [Solution](./solutions/easy/remove-duplicates-from-sorted-array.js) |
| 6 | [Remove Duplicates from Sorted Array II](https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/) | [Solution](./solutions/medium/remove-duplicates-from-sorted-array-ii.js) |
| 7 | [Find K Closest Elements](https://leetcode.com/problems/find-k-closest-elements/) | [Solution](./solutions/medium/find-k-closest-elements.js) |
| 8 | [First Missing Positive](https://leetcode.com/problems/first-missing-positive/) | [Solution](./solutions/hard/first-missing-positive.js) |
| 9 | [Find Peak Element](https://leetcode.com/problems/find-peak-element/) | [Solution](./solutions/medium/find-peak-element.js) |
| 10 | [Maximum Subarray (Kadane's)](https://leetcode.com/problems/maximum-subarray/) | [Solution](./solutions/medium/maximum-subarray.py) |
| 11 | [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) | [Solution](./solutions/medium/kth-largest-element-in-an-array.js) |
| 12 | [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) | [Solution](./solutions/medium/top-k-frequent-elements.js) |
| 13 | [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) | [Solution](./solutions/medium/longest-consecutive-sequence.js) |
| 14 | [Next Permutation](https://leetcode.com/problems/next-permutation/) | [Solution](./solutions/medium/next-permutation.js) |
| 15 | [Rotate Array](https://leetcode.com/problems/rotate-array/) | [Solution](./solutions/medium/rotate-array.js) |
| 16 | [Move Zeroes](https://leetcode.com/problems/move-zeroes/) | [Solution](./solutions/easy/move-zeroes.js) |
| 17 | [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) | [Solution](./solutions/medium/subarray-sum-equals-k.js) |

### ➤ Binary Search
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | [Solution](./solutions/medium/search-in-rotated-sorted-array.js) |
| 2 | [Find First and Last Position](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) | [Solution](./solutions/medium/find-first-and-last-position-of-element-in-sorted-array.js) |
| 3 | [Search Insert Position](https://leetcode.com/problems/search-insert-position/) | [Solution](./solutions/easy/search-insert-position.js) |
| 4 | [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | [Solution](./solutions/medium/find-minimum-in-rotated-sorted-array.js) |
| 5 | [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) | [Solution](./solutions/hard/median-of-two-sorted-arrays.js) |
| 6 | [Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/) | [Solution](./solutions/medium/search-a-2d-matrix.js) |

### ➤ Sliding Window & Substring
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) | [Solution](./solutions/medium/longest-substring-without-repeating-characters.js) |
| 2 | [Find All Anagrams in a String](https://leetcode.com/problems/find-all-anagrams-in-a-string/) | [Solution](./solutions/medium/find-all-anagrams-in-a-string.py) |
| 3 | [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/) | [Solution](./solutions/medium/longest-palindromic-substring.js) |
| 4 | [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) | [Solution](./solutions/hard/minimum-window-substring.js) |
| 5 | [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/) | [Solution](./solutions/medium/minimum-size-subarray-sum.js) |
| 6 | [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) | [Solution](./solutions/medium/maximum-product-subarray.js) |

### ➤ Intervals & Merging
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Summary Ranges](https://leetcode.com/problems/summary-ranges/) | [Solution](./solutions/easy/summary-ranges.js) |
| 2 | [Merge Intervals](https://leetcode.com/problems/merge-intervals/) | [Solution](./solutions/medium/merge-intervals.js) |
| 3 | [Insert Interval](https://leetcode.com/problems/insert-interval/) | [Solution](./solutions/medium/insert-interval.js) |
| 4 | [Minimum Number of Arrows to Burst Balloons](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/) | [Solution](./solutions/medium/minimum-number-of-arrows-to-burst-balloons.js) |

### ➤ Matrix
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Rotate Image](https://leetcode.com/problems/rotate-image/) | [Solution](./solutions/medium/rotate-image.js) |
| 2 | [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/) | [Solution](./solutions/medium/set-matrix-zeroes.js) |
| 3 | [Spiral Matrix](https://leetcode.com/problems/spiral-matrix/) | [Solution](./solutions/medium/spiral-matrix.js) |
| 4 | [Word Search](https://leetcode.com/problems/word-search/) | [Solution](./solutions/medium/word-search.js) |

### ➤ Hashmaps
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Two Sum](https://leetcode.com/problems/two-sum/) | [Solution](./solutions/easy/two-sum.js) |
| 2 | [Valid Anagram](https://leetcode.com/problems/valid-anagram/) | [Solution](./solutions/easy/valid-anagram.js) |
| 3 | [Ransom Note](https://leetcode.com/problems/ransom-note/) | [Solution](./solutions/easy/ransom-note.js) |
| 4 | [Group Anagrams](https://leetcode.com/problems/group-anagrams/) | [Solution](./solutions/medium/group-anagrams.js) |
| 5 | [Isomorphic Strings](https://leetcode.com/problems/isomorphic-strings/) | [Solution](./solutions/easy/isomorphic-strings.js) |
| 6 | [Contains Duplicate II](https://leetcode.com/problems/contains-duplicate-ii/) | [Solution](./solutions/easy/contains-duplicate-ii.js) |
| 7 | [Happy Number](https://leetcode.com/problems/happy-number/) | [Solution](./solutions/easy/happy-number.js) |

### ➤ Stacks and Queues
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) | [Solution](./solutions/easy/valid-parentheses.js) |
| 2 | [Min Stack](https://leetcode.com/problems/min-stack/) | [Solution](./solutions/medium/min-stack.js) |
| 3 | [Backspace String Compare](https://leetcode.com/problems/backspace-string-compare/) | [Solution](./solutions/medium/backspace-string-compare.js) |
| 4 | [Simplify Path](https://leetcode.com/problems/simplify-path/) | [Solution](./solutions/medium/simplify-path.py) |
| 5 | [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/) | [Solution](./solutions/medium/evaluate-reverse-polish-notation.js) |
| 6 | [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) | [Solution](./solutions/medium/daily-temperatures.js) |
| 7 | [Decode String](https://leetcode.com/problems/decode-string/) | [Solution](./solutions/medium/decode-string.js) |
| 8 | [Basic Calculator](https://leetcode.com/problems/basic-calculator/) | [Solution](./solutions/hard/basic-calculator.py) |
| 9 | [Car Fleet](https://leetcode.com/problems/car-fleet/) | [Solution](./solutions/medium/car-fleet.js) |
| 10 | [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) | [Solution](./solutions/medium/generate-parentheses.js) |
| 11 | [Asteroid Collision](https://leetcode.com/problems/asteroid-collision/) | [Solution](./solutions/medium/asteroid-collision.js) |
| 12 | [Basic Calculator II](https://leetcode.com/problems/basic-calculator-ii/) | [Solution](./solutions/medium/basic-calculator-ii.js) |
| 13 | [Maximum Frequency Stack](https://leetcode.com/problems/maximum-frequency-stack/) | [Solution](./solutions/hard/maximum-frequency-stack.js) |
| 14 | [Longest Valid Parentheses](https://leetcode.com/problems/longest-valid-parentheses/) | [Solution](./solutions/hard/longest-valid-parentheses.js) |
| 15 | [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) | [Solution](./solutions/hard/largest-rectangle-in-histogram.js) |

### ➤ Linked Lists
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) | [Solution](./solutions/easy/linked-lists/reverse-linked-list.js) |
| 2 | [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) | [Solution](./solutions/easy/linked-lists/merge-two-sorted-lists.js) |
| 3 | [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) | [Solution](./solutions/easy/linked-lists/linked-list-cycle.js) |
| 4 | [Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/) | [Solution](./solutions/easy/linked-lists/middle-of-the-linked-list.js) |
| 5 | [Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/) | [Solution](./solutions/easy/linked-lists/palindrome-linked-list.js) |
| 6 | [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) | [Solution](./solutions/medium/linked-lists/remove-nth-node-from-end-of-list.js) |
| 7 | [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) | [Solution](./solutions/medium/linked-lists/copy-list-with-random-pointer.js) |
| 8 | [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) | [Solution](./solutions/medium/linked-lists/add-two-numbers.js) |
| 9 | [Odd Even Linked List](https://leetcode.com/problems/odd-even-linked-list/) | [Solution](./solutions/medium/linked-lists/odd-even-linked-list.js) |
| 10 | [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/) | [Solution](./solutions/hard/reverse-nodes-in-k-group.js) |
| 11 | [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) | [Solution](./solutions/hard/merge-k-sorted-lists.js) |
| 12 | [LRU Cache](https://leetcode.com/problems/lru-cache/) | [Solution](./solutions/medium/linked-lists/lru-cache.py) |

### ➤ Trees
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) | [Solution](./solutions/easy/trees/invert-binary-tree.js) |
| 2 | [Same Tree](https://leetcode.com/problems/same-tree/) | [Solution](./solutions/easy/trees/same-tree.js) |
| 3 | [Symmetric Tree](https://leetcode.com/problems/symmetric-tree/) | [Solution](./solutions/easy/trees/symmetric-tree.js) |
| 4 | [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) | [Solution](./solutions/easy/trees/maximum-depth-of-binary-tree.js) |
| 5 | [Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/) | [Solution](./solutions/easy/trees/balanced-binary-tree.js) |
| 6 | [Subtree of Another Tree](https://leetcode.com/problems/subtree-of-another-tree/) | [Solution](./solutions/easy/trees/subtree-of-another-tree.js) |
| 7 | [Lowest Common Ancestor of BST](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) | [Solution](./solutions/medium/lowest-common-ancestor-bst.js) |
| 8 | [Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/) | [Solution](./solutions/easy/trees/diameter-of-binary-tree.js) |
| 9 | [Path Sum](https://leetcode.com/problems/path-sum/) | [Solution](./solutions/easy/trees/path-sum.js) |
| 10 | [Count Complete Tree Nodes](https://leetcode.com/problems/count-complete-tree-nodes/) | [Solution](./solutions/medium/count-complete-tree-nodes.js) |
| 11 | [Validate BST](https://leetcode.com/problems/validate-binary-search-tree/) | [Solution](./solutions/medium/trees/validate-binary-search-tree.js) |
| 12 | [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) | [Solution](./solutions/medium/trees/kth-smallest-element-in-a-bst.js) |
| 13 | [Construct BT from Preorder and Inorder](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | [Solution](./solutions/medium/construct-binary-tree-from-preorder-and-inorder.js) |
| 14 | [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) | [Solution](./solutions/medium/trees/binary-tree-level-order-traversal.js) |
| 15 | [Binary Tree Zigzag Level Order](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/) | [Solution](./solutions/medium/binary-tree-zigzag-level-order-traversal.js) |
| 16 | [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/) | [Solution](./solutions/medium/binary-tree-right-side-view.js) |
| 17 | [Count Good Nodes in Binary Tree](https://leetcode.com/problems/count-good-nodes-in-binary-tree/) | [Solution](./solutions/medium/trees/count-good-nodes-in-binary-tree.js) |
| 18 | [Flatten Binary Tree to Linked List](https://leetcode.com/problems/flatten-binary-tree-to-linked-list/) | [Solution](./solutions/medium/flatten-binary-tree-to-linked-list.js) |
| 19 | [Path Sum II](https://leetcode.com/problems/path-sum-ii/) | [Solution](./solutions/medium/path-sum-ii.js) |
| 20 | [Sum Root to Leaf Numbers](https://leetcode.com/problems/sum-root-to-leaf-numbers/) | [Solution](./solutions/medium/sum-root-to-leaf-numbers.js) |
| 21 | [Min Absolute Difference in BST](https://leetcode.com/problems/minimum-absolute-difference-in-bst/) | [Solution](./solutions/medium/trees/minimum-absolute-difference-in-bst.js) |
| 22 | [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/) | [Solution](./solutions/hard/binary-tree-maximum-path-sum.js) |
| 23 | [Serialize and Deserialize BT](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) | [Solution](./solutions/hard/serialize-and-deserialize-binary-tree.js) |
| 24 | [Recover Binary Search Tree](https://leetcode.com/problems/recover-binary-search-tree/) | [Solution](./solutions/hard/recover-binary-search-tree.js) |

### ➤ Trie
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/) | [Solution](./solutions/medium/tries/implement-trie-prefix-tree.js) |
| 2 | [Add and Search Words](https://leetcode.com/problems/design-add-and-search-words-data-structure/) | [Solution](./solutions/medium/tries/design-add-and-search-words-data-structure.js) |
| 3 | [Longest Word in Dictionary](https://leetcode.com/problems/longest-word-in-dictionary/) | [Solution](./solutions/medium/tries/longest-word-in-dictionary.js) |
| 4 | [Replace Words](https://leetcode.com/problems/replace-words/) | [Solution](./solutions/medium/tries/replace-words.js) |
| 5 | [Word Search II](https://leetcode.com/problems/word-search-ii/) | [Solution](./solutions/medium/tries/word-search-ii.js) |

### ➤ Heap / Priority Queue
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/) | [Solution](./solutions/easy/kth-largest-element-in-a-stream.js) |
| 2 | [Last Stone Weight](https://leetcode.com/problems/last-stone-weight/) | [Solution](./solutions/easy/last-stone-weight.js) |
| 3 | [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) | [Solution](./solutions/medium/kth-largest-element-in-an-array.js) |
| 4 | [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) | [Solution](./solutions/medium/k-closest-points-to-origin.js) |
| 5 | [Task Scheduler](https://leetcode.com/problems/task-scheduler/) | [Solution](./solutions/medium/task-scheduler.js) |
| 6 | [Top K Frequent Words](https://leetcode.com/problems/top-k-frequent-words/) | [Solution](./solutions/medium/top-k-frequent-words.js) |
| 7 | [Find K Closest Elements](https://leetcode.com/problems/find-k-closest-elements/) | [Solution](./solutions/medium/find-k-closest-elements.js) |
| 8 | [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) | [Solution](./solutions/hard/merge-k-sorted-lists.js) |
| 9 | [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) | [Solution](./solutions/hard/find-median-from-data-stream.js) |
| 10 | [Sliding Window Median](https://leetcode.com/problems/sliding-window-median/) | [Solution](./solutions/hard/sliding-window-median.js) |

### ➤ Backtracking
| # | Problem | Solution |
|---|---------|----------|
| 1 | [N-Queens](https://leetcode.com/problems/n-queens/) | [Solution](./solutions/hard/n-queens.js) |
| 2 | [Sudoku Solver](https://leetcode.com/problems/sudoku-solver/) | [Solution](./solutions/hard/sudoku-solver.js) |
| 3 | [Word Search](https://leetcode.com/problems/word-search/) | [Solution](./solutions/medium/word-search.js) |
| 4 | [Subsets](https://leetcode.com/problems/subsets/) | [Solution](./solutions/medium/subsets.js) |
| 5 | [Permutations](https://leetcode.com/problems/permutations/) | [Solution](./solutions/medium/permutations.js) |
| 6 | [Combination Sum](https://leetcode.com/problems/combination-sum/) | [Solution](./solutions/medium/combination-sum.js) |
| 7 | [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) | [Solution](./solutions/medium/generate-parentheses.js) |
| 8 | [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/) | [Solution](./solutions/medium/palindrome-partitioning.js) |
| 9 | [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) | [Solution](./solutions/medium/letter-combinations-of-a-phone-number.js) |
| 10 | [Restore IP Addresses](https://leetcode.com/problems/restore-ip-addresses/) | [Solution](./solutions/medium/restore-ip-addresses.js) |

### ➤ Graphs
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Flood Fill](https://leetcode.com/problems/flood-fill/) | [Solution](./solutions/easy/flood-fill.js) |
| 2 | [Number of Islands](https://leetcode.com/problems/number-of-islands/) | [Solution](./solutions/medium/number-of-islands.js) |
| 3 | [Max Area of Island](https://leetcode.com/problems/max-area-of-island/) | [Solution](./solutions/medium/max-area-of-island.js) |
| 4 | [Clone Graph](https://leetcode.com/problems/clone-graph/) | [Solution](./solutions/medium/clone-graph.js) |
| 5 | [Course Schedule](https://leetcode.com/problems/course-schedule/) | [Solution](./solutions/medium/course-schedule.js) |
| 6 | [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) | [Solution](./solutions/medium/course-schedule-ii.js) |
| 7 | [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) | [Solution](./solutions/medium/pacific-atlantic-water-flow.js) |
| 8 | [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) | [Solution](./solutions/medium/rotting-oranges.js) |
| 9 | [Surrounded Regions](https://leetcode.com/problems/surrounded-regions/) | [Solution](./solutions/medium/surrounded-regions.js) |
| 10 | [Redundant Connection](https://leetcode.com/problems/redundant-connection/) | [Solution](./solutions/medium/redundant-connection.js) |
| 11 | [Network Delay Time](https://leetcode.com/problems/network-delay-time/) | [Solution](./solutions/medium/network-delay-time.js) |
| 12 | [Word Ladder](https://leetcode.com/problems/word-ladder/) | [Solution](./solutions/hard/word-ladder.js) |
| 13 | [Evaluate Division](https://leetcode.com/problems/evaluate-division/) | [Solution](./solutions/medium/evaluate-division.js) |

### ➤ Dynamic Programming
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) | [Solution](./solutions/medium/dp/climbing-stairs.js) |
| 2 | [Coin Change](https://leetcode.com/problems/coin-change/) | [Solution](./solutions/medium/dp/coin-change.js) |
| 3 | [Word Break](https://leetcode.com/problems/word-break/) | [Solution](./solutions/medium/dp/word-break.js) |
| 4 | [House Robber](https://leetcode.com/problems/house-robber/) | [Solution](./solutions/medium/dp/house-robber.js) |
| 5 | [House Robber II](https://leetcode.com/problems/house-robber-ii/) | [Solution](./solutions/medium/dp/house-robber-ii.js) |
| 6 | [Unique Paths](https://leetcode.com/problems/unique-paths/) | [Solution](./solutions/medium/dp/unique-paths.js) |
| 7 | [Unique Paths II](https://leetcode.com/problems/unique-paths-ii/) | [Solution](./solutions/medium/dp/unique-paths-ii.js) |
| 8 | [0/1 Knapsack Problem](https://leetcode.com/problems/partition-equal-subset-sum/) | [Solution](./solutions/medium/dp/knapsack-01.js) |
| 9 | [Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/) | [Solution](./solutions/medium/dp/palindromic-substrings.js) |
| 10 | [Decode Ways](https://leetcode.com/problems/decode-ways/) | [Solution](./solutions/medium/dp/decode-ways.js) |
| 11 | [Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/) | [Solution](./solutions/medium/dp/minimum-path-sum.js) |
| 12 | [Maximal Square](https://leetcode.com/problems/maximal-square/) | [Solution](./solutions/medium/dp/maximal-square.js) |
| 13 | [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) | [Solution](./solutions/medium/longest-increasing-subsequence.js) |
| 14 | [Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/) | [Solution](./solutions/medium/dp/partition-equal-subset-sum.js) |
| 15 | [Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/) | [Solution](./solutions/medium/dp/cheapest-flights-within-k-stops.js) |
| 16 | [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) | [Solution](./solutions/medium/dp/longest-common-subsequence.js) |
| 17 | [Longest Valid Parentheses](https://leetcode.com/problems/longest-valid-parentheses/) | [Solution](./solutions/hard/longest-valid-parentheses.js) |
| 18 | [Wildcard Matching](https://leetcode.com/problems/wildcard-matching/) | [Solution](./solutions/hard/wildcard-matching.js) |
| 19 | [Edit Distance](https://leetcode.com/problems/edit-distance/) | [Solution](./solutions/hard/edit-distance.js) |

### ➤ Greedy Algorithms
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Jump Game](https://leetcode.com/problems/jump-game/) | [Solution](./solutions/medium/jump-game.js) |
| 2 | [Gas Station](https://leetcode.com/problems/gas-station/) | [Solution](./solutions/medium/gas-station.js) |
| 3 | [Partition Labels](https://leetcode.com/problems/partition-labels/) | [Solution](./solutions/medium/partition-labels.js) |
| 4 | [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) | [Solution](./solutions/hard/trapping-rain-water.js) |
| 5 | [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) | [Solution](./solutions/medium/container-with-most-water.js) |
| 6 | [Reorganize String](https://leetcode.com/problems/reorganize-string/) | [Solution](./solutions/medium/reorganize-string.js) |
| 7 | [Candy](https://leetcode.com/problems/candy/) | [Solution](./solutions/hard/candy.js) |

### ➤ Bit Manipulation, Maths, Misc
| # | Problem | Solution |
|---|---------|----------|
| 1 | [Single Number](https://leetcode.com/problems/single-number/) | [Solution](./solutions/easy/single-number.js) |
| 2 | [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/) | [Solution](./solutions/easy/number-of-1-bits.js) |
| 3 | [Counting Bits](https://leetcode.com/problems/counting-bits/) | [Solution](./solutions/easy/counting-bits.js) |
| 4 | [Reverse Bits](https://leetcode.com/problems/reverse-bits/) | [Solution](./solutions/easy/reverse-bits.js) |
| 5 | [Add Binary](https://leetcode.com/problems/add-binary/) | [Solution](./solutions/easy/add-binary.js) |
| 6 | [Divide Two Integers](https://leetcode.com/problems/divide-two-integers/) | [Solution](./solutions/medium/divide-two-integers.js) |
| 7 | [Single Number II](https://leetcode.com/problems/single-number-ii/) | [Solution](./solutions/medium/single-number-ii.js) |
| 8 | [Bitwise AND of Numbers Range](https://leetcode.com/problems/bitwise-and-of-numbers-range/) | [Solution](./solutions/medium/bitwise-and-of-numbers-range.js) |
| 9 | [Palindrome Number](https://leetcode.com/problems/palindrome-number/) | [Solution](./solutions/easy/palindrome-number.js) |
| 10 | [Plus One](https://leetcode.com/problems/plus-one/) | [Solution](./solutions/easy/plus-one.js) |
| 11 | [Pow(x, n)](https://leetcode.com/problems/powx-n/) | [Solution](./solutions/medium/powx-n.py) |
| 12 | [Factorial Trailing Zeroes](https://leetcode.com/problems/factorial-trailing-zeroes/) | [Solution](./solutions/medium/factorial-trailing-zeroes.py) |
| 13 | [Multiply Strings](https://leetcode.com/problems/multiply-strings/) | [Solution](./solutions/medium/multiply-strings.js) |


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
- **[System Design Case Studies](./System%20Design/Case_Studies.md)**
- **[Machine Coding Questions](./Machine%20Coding/Questions.md)**
- **[DSA Cheat Sheet & Patterns](./DSA/cheat-sheet.md)**
- **[Sorting & Searching Algorithms](./DSA/sorting-algorithms.md)**
- **[Design Patterns](./Design%20Patterns/README.md)**
- **[DevOps Interview Notes](./General%20Tech/DevOps/README.md)**
- **[Kubernetes Interview Notes](./General%20Tech/Kubernetes/README.md)**
