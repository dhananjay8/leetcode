-- ============================================
-- 6. Rising Temperature
-- LeetCode #197
-- ============================================
-- Problem: Find all dates' id with higher temperatures compared to its previous dates (yesterday).

-- Table: Weather
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | id          | int     |
-- | recordDate  | date    |
-- | temperature | int     |
-- +-------------+---------+

-- Solution 1: Self JOIN with DATEDIFF
SELECT w1.id
FROM Weather w1
JOIN Weather w2 
    ON DATEDIFF(w1.recordDate, w2.recordDate) = 1
WHERE w1.temperature > w2.temperature;

-- Solution 2: Using DATE_SUB
SELECT w1.id
FROM Weather w1
JOIN Weather w2 
    ON w1.recordDate = DATE_ADD(w2.recordDate, INTERVAL 1 DAY)
WHERE w1.temperature > w2.temperature;

-- Solution 3: Using LAG window function (MySQL 8.0+)
SELECT id
FROM (
    SELECT id, temperature, recordDate,
           LAG(temperature) OVER (ORDER BY recordDate) AS prev_temp,
           LAG(recordDate) OVER (ORDER BY recordDate) AS prev_date
    FROM Weather
) sub
WHERE temperature > prev_temp 
  AND DATEDIFF(recordDate, prev_date) = 1;

-- Explanation:
-- We join Weather with itself where w1 is "today" and w2 is "yesterday".
-- DATEDIFF(w1.recordDate, w2.recordDate) = 1 ensures exactly 1 day apart.
-- Then filter for rows where today's temp > yesterday's temp.
