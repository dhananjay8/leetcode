-- ============================================
-- 1. Combine Two Tables
-- LeetCode #175
-- ============================================
-- Problem: Write a SQL query to report the first name, last name, city, and state
-- of each person in the Person table. If the address of a personId is not present
-- in the Address table, report null instead.

-- Table: Person
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | personId    | int     |
-- | lastName    | varchar |
-- | firstName   | varchar |
-- +-------------+---------+

-- Table: Address
-- +-------------+---------+
-- | Column Name | Type    |
-- +-------------+---------+
-- | addressId   | int     |
-- | personId    | int     |
-- | city        | varchar |
-- | state       | varchar |
-- +-------------+---------+

-- Solution: Use LEFT JOIN to keep all persons even if they don't have an address
SELECT 
    p.firstName,
    p.lastName,
    a.city,
    a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;

-- Why LEFT JOIN?
-- We need ALL persons regardless of whether they have an address.
-- LEFT JOIN keeps all rows from the left table (Person) and fills NULLs
-- for columns from the right table (Address) when there's no match.
