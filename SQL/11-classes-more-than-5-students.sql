-- ============================================
-- 11. Classes More Than 5 Students
-- LeetCode #596
-- ============================================
-- Problem: Find all classes that have at least five students.

-- Table: Courses
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | student     | varchar |
-- | class       | varchar |
-- +-------------+---------+

-- Solution: GROUP BY + HAVING
SELECT class
FROM Courses
GROUP BY class
HAVING COUNT(DISTINCT student) >= 5;

-- Explanation:
-- GROUP BY class groups rows by class name.
-- COUNT(DISTINCT student) counts unique students in each class (handles potential duplicates).
-- HAVING >= 5 filters to keep only classes with 5 or more students.
-- Use HAVING (not WHERE) because we're filtering on an aggregate function.
