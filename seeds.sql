DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dept INT(11) NOT NULL,
  name VARCHAR(30) NOT NULL,
  price DECIMAL(20,2) NOT NULL,
  stock INT(10) NOT NULL,
  sales DECIMAL(20,2) DEFAULT 0
);

CREATE TABLE departments (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  over_head_costs DECIMAL(20,2) NOT NULL
);

INSERT INTO products (dept, name, price, stock)
VALUES (1, "Inspirion Laptop", 959.89, 43),
  (1, "Nintendo Switch", 174.95, 231),
  (1, "OLED TV", 1749.99, 4),
  (2, "Women's Pants, SIZE 4", 34.99, 152),
  (2, "Women's Pants, SIZE 20", 47.69, 60),
  (2, "Men's Shirt, Lg", 12.59, 139),
  (2, "White Crew Socks", 6.39, 58),
  (3, "7' Cat Tree", 39.99, 1),
  (3, "Dog Kennel, XL", 43.79, 78),
  (4, "Media Console", 359.89, 3),
  (4, "Queen Size Mattress", 1999.99, 86);

INSERT INTO departments (name, over_head_costs)
VALUES ("Electronics", 100000),
  ("Clothes", 7300),
  ("Pets", 1500),
  ("Furniture", 12000);

SELECT * FROM products;