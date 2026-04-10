-- ============================================
-- 5. Delete Duplicate Emails
-- LeetCode #196
-- ============================================
-- Problem: Delete all duplicate emails, keeping only one unique email with the smallest id.

-- Table: Person
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | email       | varchar |
-- +-------------+---------+

-- Solution 1: DELETE with self JOIN
DELETE p1
FROM Person p1
JOIN Person p2 
    ON p1.email = p2.email 
    AND p1.id > p2.id;

-- Solution 2: DELETE with subquery (keeping min id per email)
DELETE FROM Person
WHERE id NOT IN (
    SELECT * FROM (
        SELECT MIN(id) FROM Person GROUP BY email
    ) AS tmp
);

-- Explanation:
-- Solution 1: Join Person with itself on matching emails. 
-- For each pair with same email, delete the one with the larger id (p1.id > p2.id).
-- This keeps only the row with the smallest id for each email.
--
-- Solution 2: Find the minimum id for each email group, then delete all rows 
-- whose id is NOT in that set. The nested subquery is needed for MySQL compatibility.
