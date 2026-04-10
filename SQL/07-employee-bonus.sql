-- ============================================
-- 7. Employee Bonus
-- LeetCode #577
-- ============================================
-- Problem: Report the name and bonus amount of each employee with a bonus less than 1000.
-- Include employees who have no bonus record (NULL bonus).

-- Table: Employee
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | empId       | int     |
-- | name        | varchar |
-- | supervisor  | int     |
-- | salary      | int     |
-- +-------------+---------+

-- Table: Bonus
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | empId       | int     |
-- | bonus       | int     |
-- +-------------+---------+

-- Solution: LEFT JOIN + filter for bonus < 1000 OR NULL
SELECT e.name, b.bonus
FROM Employee e
LEFT JOIN Bonus b ON e.empId = b.empId
WHERE b.bonus < 1000 OR b.bonus IS NULL;

-- Explanation:
-- LEFT JOIN keeps all employees even if they have no bonus record.
-- Employees without a bonus will have NULL in the bonus column.
-- We filter for bonus < 1000 OR bonus IS NULL.
-- Important: NULL < 1000 evaluates to NULL (not TRUE), so we must explicitly check IS NULL.
