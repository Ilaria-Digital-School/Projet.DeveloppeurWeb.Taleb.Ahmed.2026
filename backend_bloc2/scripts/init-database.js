const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4'
};

// Database name
const dbName = process.env.DB_NAME || 'vagues_de_riffs';

async function initializeDatabase() {
    let connection;
    
    try {
        console.log('🔄 Connexion à MySQL...');
        
        // Connect to MySQL without specifying database
        connection = await mysql.createConnection(dbConfig);
        
        console.log('✅ Connecté à MySQL');
        
        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Base de données '${dbName}' créée ou vérifiée`);
        
        // Switch to the created database
        await connection.query(`USE \`${dbName}\``);
        
        // Create tables
        await createTables(connection);
        
        console.log('🎉 Base de données initialisée avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function createTables(connection) {
    console.log('📋 Création des tables...');
    
    // Users table
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
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
            INDEX idx_role (role),
            INDEX idx_isActive (isActive)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(usersTable);
    console.log('✅ Table "users" créée');
    
    // Concerts table
    const concertsTable = `
        CREATE TABLE IF NOT EXISTS concerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            venue_name VARCHAR(255) NOT NULL,
            venue_address TEXT NOT NULL,
            venue_city VARCHAR(100) NOT NULL,
            venue_capacity INT DEFAULT NULL,
            date DATE NOT NULL,
            time VARCHAR(5) NOT NULL,
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
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_date (date),
            INDEX idx_status (status),
            INDEX idx_venue_city (venue_city),
            INDEX idx_is_featured (is_featured),
            INDEX idx_created_by (created_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(concertsTable);
    console.log('✅ Table "concerts" créée');
    
    // Portfolio table (optional, for future use)
    const portfolioTable = `
        CREATE TABLE IF NOT EXISTS portfolio (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            image VARCHAR(500) DEFAULT NULL,
            category ENUM('album', 'concert', 'video', 'studio', 'festival', 'acoustic') NOT NULL,
            is_featured BOOLEAN DEFAULT FALSE,
            created_by INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_category (category),
            INDEX idx_is_featured (is_featured),
            INDEX idx_created_by (created_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(portfolioTable);
    console.log('✅ Table "portfolio" créée');
    
    // Contact messages table
    const contactTable = `
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('new', 'read', 'replied') DEFAULT 'new',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_createdAt (createdAt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(contactTable);
    console.log('✅ Table "contact_messages" créée');
    
    // Newsletter subscribers table
    const newsletterTable = `
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            is_active BOOLEAN DEFAULT TRUE,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.query(newsletterTable);
    console.log('✅ Table "newsletter_subscribers" créée');
}

// Run the initialization
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('🚀 Initialisation terminée');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Échec de l\'initialisation:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase, createTables };
