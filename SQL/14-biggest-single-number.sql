-- ============================================
-- 14. Biggest Single Number
-- LeetCode #619
-- ============================================
-- Problem: Find the largest number that only appears once in MyNumbers table.
-- If no single number exists, report null.

-- Table: MyNumbers
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | num         | int     |
-- +-------------+---------+

-- Solution: Subquery to find single numbers, then get the max
SELECT MAX(num) AS num
FROM (
    SELECT num
    FROM MyNumbers
    GROUP BY num
    HAVING COUNT(*) = 1
) AS single_numbers;

-- Explanation:
-- Step 1 (inner query): GROUP BY num and HAVING COUNT(*) = 1 finds numbers appearing exactly once.
-- Step 2 (outer query): MAX(num) gets the largest among those single numbers.
-- If no single number exists, MAX returns NULL automatically.
-- Using MAX() handles the "return null if empty" requirement elegantly.
