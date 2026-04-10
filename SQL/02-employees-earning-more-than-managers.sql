-- ============================================
-- 2. Employees Earning More Than Their Managers
-- LeetCode #181
-- ============================================
-- Problem: Find employees who earn more than their managers.

-- Table: Employee
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | name        | varchar |
-- | salary      | int     |
-- | managerId   | int     |
-- +-------------+---------+

-- Solution 1: Self JOIN (most common approach)
SELECT e.name AS Employee
FROM Employee e
JOIN Employee m ON e.managerId = m.id
WHERE e.salary > m.salary;

-- Solution 2: Subquery approach
SELECT e.name AS Employee
FROM Employee e
WHERE e.salary > (
    SELECT m.salary 
    FROM Employee m 
    WHERE m.id = e.managerId
);

-- Explanation:
-- We join Employee table with itself: 'e' is the employee, 'm' is the manager.
-- e.managerId = m.id links each employee to their manager.
-- Then we filter where the employee's salary exceeds their manager's salary.
