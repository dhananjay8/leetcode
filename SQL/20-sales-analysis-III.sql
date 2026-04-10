-- ============================================
-- 20. Sales Analysis III
-- LeetCode #1084
-- ============================================
-- Problem: Report products that were ONLY sold in the first quarter of 2019
-- (between 2019-01-01 and 2019-03-31 inclusive).

-- Table: Product
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | product_id  | int     |
-- | product_name| varchar |
-- | unit_price  | int     |
-- +-------------+---------+

-- Table: Sales
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | seller_id   | int     |
-- | product_id  | int     |
-- | buyer_id    | int     |
-- | sale_date   | date    |
-- | quantity    | int     |
-- | price       | int     |
-- +-------------+---------+

-- Solution 1: GROUP BY + HAVING with MIN/MAX dates
SELECT p.product_id, p.product_name
FROM Product p
JOIN Sales s ON p.product_id = s.product_id
GROUP BY p.product_id, p.product_name
HAVING MIN(s.sale_date) >= '2019-01-01' AND MAX(s.sale_date) <= '2019-03-31';

-- Solution 2: NOT IN to exclude products sold outside Q1 2019
SELECT p.product_id, p.product_name
FROM Product p
WHERE p.product_id IN (
    SELECT product_id FROM Sales
    WHERE sale_date BETWEEN '2019-01-01' AND '2019-03-31'
)
AND p.product_id NOT IN (
    SELECT product_id FROM Sales
    WHERE sale_date < '2019-01-01' OR sale_date > '2019-03-31'
);

-- Explanation:
-- We need products sold ONLY in Q1 2019 (no sales outside that range).
-- Solution 1: After grouping by product, check if the earliest sale (MIN) is >= Jan 1
-- and the latest sale (MAX) is <= Mar 31. This ensures ALL sales fall within Q1.
-- Solution 2: Find products with Q1 sales but exclude those with any non-Q1 sales.
