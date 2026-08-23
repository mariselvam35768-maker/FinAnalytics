-- ============================================================
-- Personal Finance Analytics Dashboard
-- Complete MySQL Database Schema
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+05:30";

-- Create Database
CREATE DATABASE IF NOT EXISTS `finance_dashboard` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `finance_dashboard`;

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `avatar` VARCHAR(255) DEFAULT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT '₹',
    `language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `theme` VARCHAR(10) NOT NULL DEFAULT 'dark',
    `monthly_budget` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `reset_token` VARCHAR(255) DEFAULT NULL,
    `reset_expires` DATETIME DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Categories Table
-- ============================================================
CREATE TABLE `categories` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `type` ENUM('income', 'expense') NOT NULL,
    `icon` VARCHAR(50) NOT NULL DEFAULT 'bi-tag',
    `color` VARCHAR(20) NOT NULL DEFAULT '#6c757d',
    `is_default` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_type` (`type`),
    UNIQUE KEY `uk_name_type` (`name`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Transactions Table
-- ============================================================
CREATE TABLE `transactions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `category_id` INT UNSIGNED NOT NULL,
    `type` ENUM('income', 'expense') NOT NULL,
    `amount` DECIMAL(15,2) NOT NULL,
    `description` VARCHAR(500) DEFAULT NULL,
    `transaction_date` DATE NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'Cash',
    `reference` VARCHAR(100) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_date` (`transaction_date`),
    INDEX `idx_user_type_date` (`user_id`, `type`, `transaction_date`),
    INDEX `idx_user_category` (`user_id`, `category_id`),
    CONSTRAINT `fk_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_trans_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Budgets Table
-- ============================================================
CREATE TABLE `budgets` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `category_id` INT UNSIGNED DEFAULT NULL,
    `amount` DECIMAL(15,2) NOT NULL,
    `month` INT NOT NULL,
    `year` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_cat_month_year` (`user_id`, `category_id`, `month`, `year`),
    CONSTRAINT `fk_budget_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_budget_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Notifications Table
-- ============================================================
CREATE TABLE `notifications` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `type` ENUM('budget_alert', 'large_expense', 'daily_summary', 'monthly_summary', 'info') NOT NULL DEFAULT 'info',
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_created` (`created_at`),
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Expense Categories
-- ============================================================
INSERT INTO `categories` (`name`, `type`, `icon`, `color`) VALUES
('Food', 'expense', 'bi-egg-fried', '#ff6384'),
('Transport', 'expense', 'bi-bus-front', '#36a2eb'),
('Fuel', 'expense', 'bi-fuel-pump', '#ff9f40'),
('Medical', 'expense', 'bi-hospital', '#4bc0c0'),
('Shopping', 'expense', 'bi-bag', '#9966ff'),
('Rent', 'expense', 'bi-house-door', '#ff6384'),
('Electricity', 'expense', 'bi-lightning', '#ffcd56'),
('Water Bill', 'expense', 'bi-droplet', '#36a2eb'),
('Internet', 'expense', 'bi-wifi', '#4bc0c0'),
('Mobile Recharge', 'expense', 'bi-phone', '#9966ff'),
('Entertainment', 'expense', 'bi-film', '#ff9f40'),
('Education', 'expense', 'bi-book', '#36a2eb'),
('Investment', 'expense', 'bi-graph-up-arrow', '#4bc0c0'),
('Loan', 'expense', 'bi-bank', '#ff6384'),
('Insurance', 'expense', 'bi-shield-check', '#9966ff'),
('Travel', 'expense', 'bi-airplane', '#ffcd56'),
('Swiggy', 'expense', 'bi-cart', '#ffb234'),
('Others', 'expense', 'bi-three-dots', '#6c757d');

-- ============================================================
-- Seed Income Categories
-- ============================================================
INSERT INTO `categories` (`name`, `type`, `icon`, `color`) VALUES
('Salary', 'income', 'bi-wallet2', '#28a745'),
('Freelancing', 'income', 'bi-laptop', '#17a2b8'),
('Business', 'income', 'bi-building', '#ffc107'),
('Commission', 'income', 'bi-percent', '#20c997'),
('Interest', 'income', 'bi-bank2', '#6f42c1'),
('Investment Return', 'income', 'bi-graph-up', '#fd7e14'),
('Rental Income', 'income', 'bi-house', '#0dcaf0'),
('Bonus', 'income', 'bi-gift', '#d63384'),
('Gift', 'income', 'bi-box-seam', '#198754'),
('Swiggy', 'income', 'bi-cart', '#ffb234'),
('Others', 'income', 'bi-three-dots', '#6c757d');

COMMIT;
