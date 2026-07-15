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
    firstName VARCHAR(100) NOT NULL COMMENT 'Prénom de l\'utilisateur',
    lastName VARCHAR(100) NOT NULL COMMENT 'Nom de l\'utilisateur',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email unique de l\'utilisateur',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nom d\'utilisateur unique',
    password VARCHAR(255) NOT NULL COMMENT 'Mot de passe hashé avec bcrypt',
    birthDate DATE NOT NULL COMMENT 'Date de naissance',
    newsletter BOOLEAN DEFAULT FALSE COMMENT 'Abonné à la newsletter',
    role ENUM('user', 'admin') DEFAULT 'user' COMMENT 'Rôle de l\'utilisateur',
    isActive BOOLEAN DEFAULT TRUE COMMENT 'Compte actif ou non',
    lastLogin TIMESTAMP NULL COMMENT 'Dernière connexion',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    
    -- Index pour optimiser les performances
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_isActive (isActive),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table des utilisateurs du site Vagues de Riffs Portfolio';

-- =====================================================
-- Table des concerts
-- =====================================================
CREATE TABLE concerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'Titre du concert',
    venue_name VARCHAR(255) NOT NULL COMMENT 'Nom de la salle de concert',
    venue_address TEXT NOT NULL COMMENT 'Adresse complète de la salle',
    venue_city VARCHAR(100) NOT NULL COMMENT 'Ville de la salle',
    venue_capacity INT DEFAULT NULL COMMENT 'Capacité d\'accueil de la salle',
    concert_date DATE NOT NULL COMMENT 'Date du concert',
    concert_time VARCHAR(5) NOT NULL COMMENT 'Heure du concert (format HH:MM)',
    price_min DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Prix minimum',
    price_max DECIMAL(10,2) DEFAULT NULL COMMENT 'Prix maximum',
    price_currency VARCHAR(3) DEFAULT 'EUR' COMMENT 'Devise du prix',
    description TEXT DEFAULT NULL COMMENT 'Description du concert',
    status ENUM('upcoming', 'sold_out', 'cancelled', 'completed') DEFAULT 'upcoming' COMMENT 'Statut du concert',
    ticket_url VARCHAR(500) DEFAULT NULL COMMENT 'URL pour acheter les billets',
    info_url VARCHAR(500) DEFAULT NULL COMMENT 'URL pour plus d\'informations',
    image VARCHAR(500) DEFAULT NULL COMMENT 'URL de l\'image du concert',
    is_featured BOOLEAN DEFAULT FALSE COMMENT 'Concert en vedette',
    created_by INT NOT NULL COMMENT 'ID de l\'utilisateur qui a créé le concert',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    
    -- Index pour optimiser les performances
    INDEX idx_date (concert_date),
    INDEX idx_status (status),
    INDEX idx_venue_city (venue_city),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_by (created_by),
    INDEX idx_createdAt (createdAt),
    
    -- Contrainte de clé étrangère
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table des concerts du groupe Vagues de Riffs';

-- =====================================================
-- Table du portfolio (réalisations du groupe)
-- =====================================================
CREATE TABLE portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'Titre de l\'œuvre',
    description TEXT NOT NULL COMMENT 'Description détaillée',
    image VARCHAR(500) DEFAULT NULL COMMENT 'URL de l\'image',
    category ENUM('album', 'concert', 'video', 'studio', 'festival', 'acoustic') NOT NULL COMMENT 'Catégorie de l\'œuvre',
    is_featured BOOLEAN DEFAULT FALSE COMMENT 'Mise en avant sur le site',
    created_by INT NOT NULL COMMENT 'ID de l\'utilisateur qui a créé l\'œuvre',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    
    -- Index pour optimiser les performances
    INDEX idx_category (category),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_by (created_by),
    INDEX idx_createdAt (createdAt),
    
    -- Contrainte de clé étrangère
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Portfolio des réalisations du groupe Vagues de Riffs';

-- =====================================================
-- Table des messages de contact
-- =====================================================
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Nom de l\'expéditeur',
    email VARCHAR(255) NOT NULL COMMENT 'Email de l\'expéditeur',
    subject VARCHAR(255) NOT NULL COMMENT 'Sujet du message',
    message TEXT NOT NULL COMMENT 'Contenu du message',
    status ENUM('new', 'read', 'replied') DEFAULT 'new' COMMENT 'Statut du message',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de réception',
    
    -- Index pour optimiser les performances
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Messages du formulaire de contact';

-- =====================================================
-- Table des abonnés à la newsletter
-- =====================================================
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email de l\'abonné',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Abonnement actif ou non',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d\'abonnement',
    
    -- Index pour optimiser les performances
    INDEX idx_email (email),
    INDEX idx_is_active (is_active),
    INDEX idx_subscribed_at (subscribed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Abonnés à la newsletter Vagues de Riffs';

-- =====================================================
-- Insertion de l'administrateur par défaut
-- =====================================================

-- Hash du mot de passe 'admin123' avec bcrypt (cost: 12)
-- Ce hash correspond à : admin123
INSERT INTO users (firstName, lastName, email, username, password, birthDate, newsletter, role, isActive) VALUES (
    'Admin', 
    'Vagues de Riffs', 
    'admin@vaguesderiffs.fr', 
    '$2a$12$LQv3cWDy0Vf76hBkByL.5Vr8z5f/9', 
    '1990-01-01', 
    0,
    'admin', 
    1
);

-- =====================================================
-- Finalisation
-- =====================================================

-- Affichage du résumé de la création
SELECT 'Tables created successfully in vagues_de_riffs_portfolio!' as message;

-- Affichage du nombre d'enregistrements créés
SELECT 
    CONCAT('Tables created: ', COUNT(*)) as summary
FROM (
    SELECT 'users' as table_name, COUNT(*) as count FROM users
    UNION ALL
    SELECT 'concerts' as table_name, COUNT(*) as count FROM concerts
    UNION ALL
    SELECT 'portfolio' as table_name, COUNT(*) as count FROM portfolio
    UNION ALL
    SELECT 'contact_messages' as table_name, COUNT(*) as count FROM contact_messages
    UNION ALL
    SELECT 'newsletter_subscribers' as table_name, COUNT(*) as count FROM newsletter_subscribers
) table_counts;
