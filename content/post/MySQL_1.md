+++
date = '2025-09-17T22:04:47+08:00'
draft = false
title = 'MySQL_1'
summary = '力扣最近做的MySQL题'
tags = ['mysql']
+++
# MySQL手撕/思路题(1)

> 分为：（1）SQL查询手写题（2）大数据量等场景题
>
> 手写题：
>
> - 核心考点：自连接/表连接`join on`，分组去重 `group by+having `
>
> - 解题思路： 查询语句的执行顺序：
>
>   表连接 ---> where 过滤非指定记录 --->group by + having 分组去重 -----> select 选择返回列 -----> distinct 去重------>order by 排序 -----> limit 限制行数
>
>   | ①    | FROM     | 确定主表，准备数据             |
>   | ---- | -------- | ------------------------------ |
>   | ②    | ON       | 连接多个表的条件               |
>   | ③    | JOIN     | 执行 INNER JOIN / LEFT JOIN 等 |
>   | ④    | WHERE    | 过滤行数据（提高效率）         |
>   | ⑤    | GROUP BY | 进行分组                       |
>   | ⑥    | HAVING   | 过滤聚合后的数据               |
>   | ⑦    | SELECT   | 选择最终返回的列               |
>   | ⑧    | DISTINCT | 进行去重                       |
>   | ⑨    | ORDER BY | 对最终结果排序                 |
>   | ⑩    | LIMIT    | 限制返回行数                   |

1. [组合两个表](https://leetcode.cn/problems/combine-two-tables/)

   ![image-20250914104753264](C:/Users/79042/AppData/Roaming/Typora/typora-user-images/image-20250914104753264.png)

   - 表连接的： `left join` 左外连接

     ```MySQL
     Select FirstName,LastName,City,State From Person Left Join Address On Person.personId  = Address.personId ;
     ```



2. [超过经理收入的员工](https://leetcode.cn/problems/employees-earning-more-than-their-managers/)

   ![image-20250914105015480](C:/Users/79042/AppData/Roaming/Typora/typora-user-images/image-20250914105015480.png)

   ![image-20250914105033610](C:/Users/79042/AppData/Roaming/Typora/typora-user-images/image-20250914105033610.png)

   - 我们需要**将单张表，根据：`mannagerId`分为两张表**；通**过 `e1.managerid=e2.id`，得到 e1员工表符合条件的员工名称**

   - 方法1：子查询（速度慢）

     ```MySQL
     select name Employee from Employee e1
     where  salary > (select salary from Employee e2 where e1.managerId = e2.id)
     ```

     - **主查询**：
       - `FROM Employee e1`：从 `Employee` 表中查询，并用别名 `e1` 代表 “员工”
       - `SELECT name Employee`：最终返回这些员工的姓名，列名为 `Employee`
     - **子查询**：
       - `SELECT salary FROM Employee e2 WHERE e1.managerId = e2.id`
         - 用别名 `e2` 代表 “经理”
         - 条件 `e1.managerId = e2.id` 表示：找到 `e1`（员工）的直接上级，即 `managerId` 等于 `e2.id` 的人（经理）
         - 子查询的结果是 **该员工对应经理的薪资**

   - 方法2：自连接表：自内连接，条件 `e1.managerid=e2.id`

     ```MySQL
     SELECT e1.name Employee  -- 最终返回“员工”的姓名，列名显示为 Employee
     FROM Employee e1         -- 第一个虚拟表：e1 = 员工表
     JOIN Employee e2         -- 内连接第二个虚拟表：e2 = 经理表（JOIN 默认是 INNER JOIN）
     ON e1.managerid = e2.id  -- 连接条件：员工的“上级ID” = 经理的“员工ID”（找到每个员工对应的经理）
     WHERE e1.salary > e2.salary  -- 过滤条件：员工薪资 > 其经理薪资
     ```

   - 方法3：Where语句

     ```MySQL
     SELECT
         a.Name AS 'Employee'
     FROM
         Employee AS a,
         Employee AS b
     WHERE
         a.ManagerId = b.Id
             AND a.Salary > b.Salary
     ;
     ```

     

   

3. [查找重复的电子邮箱](https://leetcode.cn/problems/duplicate-emails/)

   ![image-20250916151222336](./assets/image-20250916151222336.png)

   - 自连接： 

     > 注意，表连接是将：两张表和为一张表（e1.id != e2.id 去除自身重复，但仍有对称重复的），需要 DISTINCT 去重 

     ```mysql
     # 内连接实现自连接： 
     select DISTINCT  e1.email from Person e1 
     join Person e2 on e1.email = e2.email
     where e1.id != e2.id
     
     # from两张自身表，实现连接：
     select distinct a.email 
     from Person a,Person b
     where a.email = b.email and a.id != b.id
     ```

   - **分组去重`group by + having`：**

     ```mysql
     select email 
     from Person group by email having count(email)>1
     ```

4. [从不订购的客户](https://leetcode.cn/problems/customers-who-never-order/)

   ![image-20250916152137258](./assets/image-20250916152137258.png)

   - 表连接：左外连接，没有购买的用户的`Orders.id` is null 

     ```mysql
     select name Customers 
     from Customers left join Orders on Customers.id = Orders.customerId
     where Orders.id is Null;
     ```

   - 排除 `not in`：

     ```MySQL
     select *
     from customers
     where customers.id not in
     (
         select customerid from orders
     );
     ```

     

5. [删除重复的电子邮箱](https://leetcode.cn/problems/delete-duplicate-emails/)

   - 删除重复的记录，但保留：重复的最小id的记录，而不是删除所有记录

     - 采用 group by + having 会删除所有重复的记录，只留下不重复的记录
     - 采用 表连接，选择删除 id 更大的重复记录，就会保留 重复id最小的记录

     ```mysql
     DELETE p1 FROM Person p1, Person p2
     WHERE p1.email = p2.email AND p1.id > p2.id;
     ```




6. [上升的温度](https://leetcode.cn/problems/rising-temperature/)

   ![image-20250917144936096](./assets/image-20250917144936096.png)

   - 表自连接：

     - `DATE_ADD(<DATE>，INTERVAL 1 DAY)` 表示昨天
     - `datediff(w2.recordDate, w1.recordDate) = 1` ：w1为昨天

     ```mysql
     # 隐式自连接
     select a.id  from Weather a,Weather b
     where a.recordDate=DATE_ADD(b.recordDate,INTERVAL 1 DAY) and a.temperature > b.temperature  
     # 显式自连接
     select a.id from Weather a
     join Weather b 
     on a.recordDate = DATE_ADD(b.recordDate,INTERVAL 1 DAY) 
     where a.temperature > b.temperature;
     ```



7. [游戏玩法分析 I](https://leetcode.cn/problems/game-play-analysis-i/)

   ![image-20250917151855435](./assets/image-20250917151855435.png)

   - 分组 + `min(event_date)` 选择最早登录日期返回，而非默认返回

     ```mysql
     select a.player_id player_id,min(a.event_date) first_login
     from Activity a
     group by player_id 
     ```

     
