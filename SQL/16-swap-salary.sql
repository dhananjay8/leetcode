-- ============================================
-- 16. Swap Salary
-- LeetCode #627
-- ============================================
-- Problem: Swap all 'f' and 'm' values in the sex column with a single UPDATE statement.
-- (No intermediate temp table allowed)

-- Table: Salary
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | name        | varchar |
-- | sex         | ENUM('m','f') |
-- | salary      | int     |
-- +-------------+---------+

-- Solution 1: CASE statement
UPDATE Salary
SET sex = CASE 
    WHEN sex = 'm' THEN 'f'
    WHEN sex = 'f' THEN 'm'
END;

-- Solution 2: IF function (MySQL)
UPDATE Salary
SET sex = IF(sex = 'm', 'f', 'm');

-- Solution 3: Using CHAR/ASCII trick
-- 'm' ASCII = 109, 'f' ASCII = 102, sum = 211
-- To swap: CHAR(211 - ASCII(sex))
UPDATE Salary
SET sex = CHAR(ASCII('m') + ASCII('f') - ASCII(sex));

-- Explanation:
-- CASE statement evaluates each row: if 'm' switch to 'f', if 'f' switch to 'm'.
-- This is done in a single UPDATE without needing a temp variable.
-- The IF shorthand works because there are only two possible values.
