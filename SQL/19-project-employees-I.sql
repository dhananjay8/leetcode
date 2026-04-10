-- ============================================
-- 19. Project Employees I
-- LeetCode #1075
-- ============================================
-- Problem: Report the average experience years of all employees for each project,
-- rounded to 2 decimal places.

-- Table: Project
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | project_id  | int     |
-- | employee_id | int     |
-- +-------------+---------+

-- Table: Employee
-- +------------------+---------+
-- | Column Name      | Type    |
-- +------------------+---------+
-- | employee_id      | int     |
-- | name             | varchar |
-- | experience_years | int     |
-- +------------------+---------+

-- Solution: JOIN + GROUP BY + AVG
SELECT p.project_id, ROUND(AVG(e.experience_years), 2) AS average_years
FROM Project p
JOIN Employee e ON p.employee_id = e.employee_id
GROUP BY p.project_id;

-- Explanation:
-- JOIN Project with Employee to get experience_years for each project member.
-- GROUP BY project_id to calculate per-project statistics.
-- AVG(experience_years) computes the average experience for each project.
-- ROUND(..., 2) rounds the result to 2 decimal places as required.
