-- ============================================
-- 8. Find Customer Referee
-- LeetCode #584
-- ============================================
-- Problem: Find the names of customers NOT referred by the customer with id = 2.

-- Table: Customer
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | name        | varchar |
-- | referee_id  | int     |
-- +-------------+---------+

-- Solution: Handle NULL values properly
SELECT name
FROM Customer
WHERE referee_id != 2 OR referee_id IS NULL;

-- Alternative using COALESCE
SELECT name
FROM Customer
WHERE COALESCE(referee_id, 0) != 2;

-- Alternative using IFNULL (MySQL specific)
SELECT name
FROM Customer
WHERE IFNULL(referee_id, 0) != 2;

-- Explanation:
-- Tricky part: Customers with referee_id = NULL are NOT referred by anyone.
-- NULL != 2 evaluates to NULL (not TRUE), so those rows would be excluded.
-- We must explicitly include rows where referee_id IS NULL.
-- COALESCE replaces NULL with 0, making the comparison work as expected.
