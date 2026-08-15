# SQL Interview Track

Structured list of common SQL interview problems with local solutions.

## Problem Index

| # | Problem | LeetCode | Local Solution | Pattern Focus |
|---|---|---|---|---|
| 1 | Combine Two Tables | [175](https://leetcode.com/problems/combine-two-tables/) | [`01-combine-two-tables.sql`](./01-combine-two-tables.sql) | `LEFT JOIN` |
| 2 | Employees Earning More Than Their Managers | [181](https://leetcode.com/problems/employees-earning-more-than-their-managers/) | [`02-employees-earning-more-than-managers.sql`](./02-employees-earning-more-than-managers.sql) | Self join |
| 3 | Duplicate Emails | [182](https://leetcode.com/problems/duplicate-emails/) | [`03-duplicate-emails.sql`](./03-duplicate-emails.sql) | `GROUP BY` + `HAVING` |
| 4 | Customers Who Never Order | [183](https://leetcode.com/problems/customers-who-never-order/) | [`04-customers-who-never-order.sql`](./04-customers-who-never-order.sql) | Anti-join |
| 5 | Delete Duplicate Emails | [196](https://leetcode.com/problems/delete-duplicate-emails/) | [`05-delete-duplicate-emails.sql`](./05-delete-duplicate-emails.sql) | De-dup delete |
| 6 | Rising Temperature | [197](https://leetcode.com/problems/rising-temperature/) | [`06-rising-temperature.sql`](./06-rising-temperature.sql) | Date + self join |
| 7 | Employee Bonus | [577](https://leetcode.com/problems/employee-bonus/) | [`07-employee-bonus.sql`](./07-employee-bonus.sql) | `LEFT JOIN` + filter |
| 8 | Find Customer Referee | [584](https://leetcode.com/problems/find-customer-referee/) | [`08-find-customer-referee.sql`](./08-find-customer-referee.sql) | `NULL` handling |
| 10 | Big Countries | [595](https://leetcode.com/problems/big-countries/) | [`10-big-countries.sql`](./10-big-countries.sql) | Simple filter |
| 11 | Classes More Than 5 Students | [596](https://leetcode.com/problems/classes-more-than-5-students/) | [`11-classes-more-than-5-students.sql`](./11-classes-more-than-5-students.sql) | Aggregation |
| 12 | Sales Person | [607](https://leetcode.com/problems/sales-person/) | [`12-sales-person.sql`](./12-sales-person.sql) | Multi-table filtering |
| 13 | Triangle Judgement | [610](https://leetcode.com/problems/triangle-judgement/) | [`13-triangle-judgement.sql`](./13-triangle-judgement.sql) | `CASE WHEN` |
| 14 | Biggest Single Number | [619](https://leetcode.com/problems/biggest-single-number/) | [`14-biggest-single-number.sql`](./14-biggest-single-number.sql) | Aggregation + max |
| 15 | Not Boring Movies | [620](https://leetcode.com/problems/not-boring-movies/) | [`15-not-boring-movies.sql`](./15-not-boring-movies.sql) | Filter + sort |
| 16 | Swap Salary | [627](https://leetcode.com/problems/swap-salary/) | [`16-swap-salary.sql`](./16-swap-salary.sql) | Conditional update |
| 18 | Product Sales Analysis I | [1068](https://leetcode.com/problems/product-sales-analysis-i/) | [`18-product-sales-analysis-I.sql`](./18-product-sales-analysis-I.sql) | Join projection |
| 19 | Project Employees I | [1075](https://leetcode.com/problems/project-employees-i/) | [`19-project-employees-I.sql`](./19-project-employees-I.sql) | Group average |
| 20 | Sales Analysis III | [1084](https://leetcode.com/problems/sales-analysis-iii/) | [`20-sales-analysis-III.sql`](./20-sales-analysis-III.sql) | Date range filtering |

## How to Practice

- Solve first without opening SQL files.
- Compare with the local solution and note query simplifications.
- Re-solve weak query patterns after 3, 7, and 21 days.
