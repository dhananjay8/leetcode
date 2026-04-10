-- ============================================
-- 15. Not Boring Movies
-- LeetCode #620
-- ============================================
-- Problem: Report movies with an odd-numbered id and description NOT equal to "boring".
-- Return result ordered by rating in descending order.

-- Table: Cinema
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | movie       | varchar |
-- | description | varchar |
-- | rating      | float   |
-- +-------------+---------+

-- Solution: Filter odd id + non-boring, order by rating DESC
SELECT *
FROM Cinema
WHERE id % 2 = 1 AND description != 'boring'
ORDER BY rating DESC;

-- Alternative using MOD function
SELECT *
FROM Cinema
WHERE MOD(id, 2) = 1 AND description <> 'boring'
ORDER BY rating DESC;

-- Alternative using bitwise AND (checks if last bit is 1 = odd)
SELECT *
FROM Cinema
WHERE id & 1 = 1 AND description != 'boring'
ORDER BY rating DESC;

-- Explanation:
-- id % 2 = 1 checks if the id is odd (remainder when divided by 2 is 1).
-- description != 'boring' excludes boring movies.
-- ORDER BY rating DESC sorts by highest rating first.
