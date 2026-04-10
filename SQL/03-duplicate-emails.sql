-- ============================================
-- 3. Duplicate Emails
-- LeetCode #182
-- ============================================
-- Problem: Find all duplicate emails in the Person table.

-- Table: Person
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | email       | varchar |
-- +-------------+---------+

-- Solution 1: GROUP BY + HAVING (cleanest approach)
SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(*) > 1;

-- Solution 2: Self JOIN
SELECT DISTINCT p1.email AS Email
FROM Person p1
JOIN Person p2 ON p1.email = p2.email AND p1.id != p2.id;

-- Solution 3: Subquery with COUNT
SELECT email AS Email
FROM (
    SELECT email, COUNT(*) AS cnt
    FROM Person
    GROUP BY email
) sub
WHERE cnt > 1;

-- Explanation:
-- GROUP BY email groups all rows with the same email together.
-- HAVING COUNT(*) > 1 filters to keep only groups with more than one occurrence.
-- HAVING is like WHERE but works on aggregated (grouped) results.
