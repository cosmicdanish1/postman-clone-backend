-- Create the database
CREATE DATABASE IF NOT EXISTS postman_clone;

-- Use the database
USE postman_clone;

-- Create history table to store API request history
CREATE TABLE IF NOT EXISTS request_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method ENUM('GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS','CONNECT','TRACE') NOT NULL,
    url VARCHAR(2048) NOT NULL,
    month VARCHAR(2),        -- MM (01-12)
    day VARCHAR(2),          -- DD (01-31)
    year VARCHAR(4),         -- YYYY
    time VARCHAR(11),        -- HH:MM:SS AM/PM
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create an index on created_at for faster date-based queries
CREATE INDEX idx_created_at ON request_history(created_at);

-- Create an index on method for filtering by HTTP method
CREATE INDEX idx_method ON request_history(method);

-- Sample data (optional, can be removed)
INSERT INTO request_history 
(method, url, month, day, year, time)
VALUES 
('GET', 'https://jsonplaceholder.typicode.com/todos/1', '07', '14', '2025', '02:35:45 PM'),
('POST', 'https://jsonplaceholder.typicode.com/posts', '07', '14', '2025', '02:36:20 PM');
