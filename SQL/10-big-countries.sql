-- ============================================
-- 10. Big Countries
-- LeetCode #595
-- ============================================
-- Problem: Find name, population, and area of big countries.
-- A country is big if it has area >= 3,000,000 OR population >= 25,000,000.

-- Table: World
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | name        | varchar |
-- | continent   | varchar |
-- | area        | int     |
-- | population  | int     |
-- | gdp         | bigint  |
-- +-------------+---------+

-- Solution 1: Simple OR condition
SELECT name, population, area
FROM World
WHERE area >= 3000000 OR population >= 25000000;

-- Solution 2: UNION (can be faster if both columns are indexed)
SELECT name, population, area FROM World WHERE area >= 3000000
UNION
SELECT name, population, area FROM World WHERE population >= 25000000;

-- Explanation:
-- Straightforward filtering with OR.
-- UNION approach can leverage separate indexes on area and population columns.
-- UNION automatically removes duplicates (countries that satisfy both conditions).
