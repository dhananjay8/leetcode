-- ============================================
-- 18. Product Sales Analysis I
-- LeetCode #1068
-- ============================================
-- Problem: Report the product_name, year, and price for each sale_id in the Sales table.

-- Table: Sales
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | sale_id     | int     |
-- | product_id  | int     |
-- | year        | int     |
-- | quantity    | int     |
-- | price       | int     |
-- +-------------+---------+

-- Table: Product
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | product_id  | int     |
-- | product_name| varchar |
-- +-------------+---------+

-- Solution: Simple JOIN
SELECT p.product_name, s.year, s.price
FROM Sales s
JOIN Product p ON s.product_id = p.product_id;

-- Alternative with LEFT JOIN (same result here since every sale has a product)
SELECT p.product_name, s.year, s.price
FROM Sales s
LEFT JOIN Product p ON s.product_id = p.product_id;

-- Explanation:
-- JOIN Sales with Product on product_id to get product_name.
-- Each row in Sales maps to exactly one Product, so INNER JOIN works perfectly.
-- We select product_name from Product table and year, price from Sales table.
