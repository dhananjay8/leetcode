-- ============================================
-- 12. Sales Person
-- LeetCode #607
-- ============================================
-- Problem: Find the names of all salespersons who did NOT have any orders
-- related to the company "RED".

-- Table: SalesPerson
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | sales_id    | int     |
-- | name        | varchar |
-- | salary      | int     |
-- | commission_rate | int |
-- | hire_date   | date    |
-- +-------------+---------+

-- Table: Company
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | com_id      | int     |
-- | name        | varchar |
-- | city        | varchar |
-- +-------------+---------+

-- Table: Orders
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | order_id    | int     |
-- | order_date  | date    |
-- | com_id      | int     |
-- | sales_id    | int     |
-- | amount      | int     |
-- +-------------+---------+

-- Solution 1: NOT IN with subquery
SELECT s.name
FROM SalesPerson s
WHERE s.sales_id NOT IN (
    SELECT o.sales_id
    FROM Orders o
    JOIN Company c ON o.com_id = c.com_id
    WHERE c.name = 'RED'
);

-- Solution 2: NOT EXISTS
SELECT s.name
FROM SalesPerson s
WHERE NOT EXISTS (
    SELECT 1
    FROM Orders o
    JOIN Company c ON o.com_id = c.com_id
    WHERE c.name = 'RED' AND o.sales_id = s.sales_id
);

-- Explanation:
-- Step 1: Find all sales_ids that have orders linked to company "RED".
-- Step 2: Select salespersons whose sales_id is NOT in that set.
-- The subquery joins Orders with Company to identify "RED" company orders.
