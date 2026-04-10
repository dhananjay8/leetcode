-- ============================================
-- 4. Customers Who Never Order
-- LeetCode #183
-- ============================================
-- Problem: Find all customers who never ordered anything.

-- Table: Customers
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | name        | varchar |
-- +-------------+---------+

-- Table: Orders
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | customerId  | int     |
-- +-------------+---------+

-- Solution 1: NOT IN subquery
SELECT name AS Customers
FROM Customers
WHERE id NOT IN (SELECT customerId FROM Orders);

-- Solution 2: LEFT JOIN + NULL check
SELECT c.name AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.id = o.customerId
WHERE o.id IS NULL;

-- Solution 3: NOT EXISTS
SELECT c.name AS Customers
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1 FROM Orders o WHERE o.customerId = c.id
);

-- Explanation:
-- NOT IN: Get all customerIds from Orders, then find Customers whose id is NOT in that list.
-- LEFT JOIN: Join all customers with orders; customers with no orders will have NULL in order columns.
-- NOT EXISTS: For each customer, check if any matching order exists. Keep those where none exists.
-- NOT EXISTS is generally most performant for large datasets.
