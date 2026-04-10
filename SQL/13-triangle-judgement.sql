-- ============================================
-- 13. Triangle Judgement
-- LeetCode #610
-- ============================================
-- Problem: Report for every three line segments whether they can form a triangle.

-- Table: Triangle
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | x           | int     |
-- | y           | int     |
-- | z           | int     |
-- +-------------+---------+

-- Solution: Triangle inequality theorem
-- Three sides form a triangle if and only if the sum of any two sides > the third side.
SELECT x, y, z,
    CASE
        WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes'
        ELSE 'No'
    END AS triangle
FROM Triangle;

-- Alternative using IF (MySQL)
SELECT x, y, z,
    IF(x + y > z AND x + z > y AND y + z > x, 'Yes', 'No') AS triangle
FROM Triangle;

-- Explanation:
-- Triangle Inequality Theorem: A triangle can be formed if and only if:
--   side1 + side2 > side3 (for ALL three combinations)
-- We check all three conditions: x+y>z, x+z>y, y+z>x.
-- If all three are true, it's a valid triangle.
