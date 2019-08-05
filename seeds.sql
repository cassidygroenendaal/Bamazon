DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  dept VARCHAR(30) NOT NULL,
  price DECIMAL(20,2) NOT NULL,
  stock INT(10) NOT NULL,
  sales DECIMAL(20,2) DEFAULT 0
);

CREATE TABLE departments (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  over_head_costs INT(10)
);

INSERT INTO products (name, dept, price, stock)
VALUES ("Inspirion Laptop", "Electronics", 959.89, 43),
  ("Nintendo Switch", "Electronics", 174.95, 231),
  ("OLED TV", "Electronics", 1749.99, 4),
  ("Women's Pants, SIZE 4", "Clothes", 34.99, 152),
  ("Women's Pants, SIZE 20", "Clothes", 47.69, 60),
  ("Men's Shirt, Lg", "Clothes", 12.59, 139),
  ("White Crew Socks", "Clothes", 6.39, 58),
  ("7' Cat Tree", "Pets", 39.99, 1),
  ("Dog Kennel, XL", "Pets", 43.79, 78),
  ("Media Console", "Furniture", 359.89, 3),
  ("Queen Size Mattress", "Furniture", 1999.99, 86);

SELECT * FROM products;