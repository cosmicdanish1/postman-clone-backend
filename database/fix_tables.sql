-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS postman_clone;

-- Use the database
USE postman_clone;

-- Drop existing history table if it exists
DROP TABLE IF EXISTS request_history;

-- Create the request_history table with the correct schema
CREATE TABLE IF NOT EXISTS request_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method ENUM('GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS','CONNECT','TRACE') NOT NULL,
    url VARCHAR(2048) NOT NULL,
    month VARCHAR(2),
    day VARCHAR(2),
    year VARCHAR(4),
    time VARCHAR(11),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add indexes for better performance
CREATE INDEX idx_created_at ON request_history(created_at);
CREATE INDEX idx_method ON request_history(method);

-- Verify the table was created
SHOW TABLES;
DESCRIBE request_history;
