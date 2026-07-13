-- =====================================================
-- Script de création des tables pour la base de données vagues_de_riffs_portfolio
-- Créé le: 31 Mars 2024
-- Version: 1.0
-- =====================================================

-- Suppression des tables si elles existent
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS portfolio;
DROP TABLE IF EXISTS concerts;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Table des utilisateurs
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    birthDate DATE NOT NULL,
    newsletter BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'admin') DEFAULT 'user',
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table des concerts
-- =====================================================
CREATE TABLE concerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    venue_address TEXT NOT NULL,
    venue_city VARCHAR(100) NOT NULL,
    venue_capacity INT DEFAULT NULL,
    concert_date DATE NOT NULL,
    concert_time VARCHAR(5) NOT NULL,
    price_min DECIMAL(10,2) DEFAULT 0.00,
    price_max DECIMAL(10,2) DEFAULT NULL,
    price_currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT DEFAULT NULL,
    status ENUM('upcoming', 'sold_out', 'cancelled', 'completed') DEFAULT 'upcoming',
    ticket_url VARCHAR(500) DEFAULT NULL,
    info_url VARCHAR(500) DEFAULT NULL,
    image VARCHAR(500) DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (concert_date),
    INDEX idx_status (status),
    INDEX idx_venue_city (venue_city),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_by (created_by),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table du portfolio
-- =====================================================
CREATE TABLE portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(500) DEFAULT NULL,
    category ENUM('album', 'concert', 'video', 'studio', 'festival', 'acoustic') NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_by (created_by),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table des messages de contact
-- =====================================================
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table des abonnés à la newsletter
-- =====================================================
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Insertion de l'administrateur par défaut
-- =====================================================

-- Mot de passe: admin123
INSERT INTO users (firstName, lastName, email, username, password, birthDate, newsletter, role, isActive) 
VALUES ('Admin', 'Vagues de Riffs', 'admin@vaguesderiffs.fr', 'admin', '$2a$12$LQv3cWDy0Vf76hBkByL.5Vr8z5f/9', '1990-01-01', 0, 'admin', 1);

-- =====================================================
-- Finalisation
-- =====================================================

SELECT 'Tables created successfully in vagues_de_riffs_portfolio!' as message;
