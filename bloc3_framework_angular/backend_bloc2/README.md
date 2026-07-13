# Vagues de Riffs - Backend API (MySQL)

Backend API pour le site web du groupe de rock "Vagues de Riffs" utilisant MySQL.

## Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de données relationnelle
- **MySQL2** - Driver MySQL pour Node.js
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données

## Installation

### 1. Prérequis

- Node.js (version 14 ou supérieure)
- MySQL (version 5.7 ou supérieure)
- npm ou yarn

### 2. Configuration de la base de données

1. Démarrer MySQL
2. Créer la base de données :
```sql
CREATE DATABASE vagues_de_riffs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Configurer les variables d'environnement dans le fichier `.env` :
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=vagues_de_riffs

# JWT Configuration
JWT_SECRET=vagues-de-riffs-secret-key-2024
JWT_EXPIRE=7d
```

### 3. Installation des dépendances

```bash
cd backend
npm install
```

### 4. Initialisation de la base de données

```bash
# Créer les tables
npm run init-db

# Peupler avec des données d'exemple
npm run seed-db
```

### 5. Démarrage du serveur

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Structure de la base de données

### Table `users`

```sql
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
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table `concerts`

```sql
CREATE TABLE concerts (
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
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### Table `portfolio`

```sql
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
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### Table `contact_messages`

```sql
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `newsletter_subscribers`

```sql
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentification (`/api/auth`)
- `POST /register` - Inscription d'un nouvel utilisateur
- `POST /login` - Connexion d'un utilisateur
- `GET /me` - Obtenir le profil de l'utilisateur connecté
- `POST /logout` - Déconnexion

### Utilisateurs (`/api/users`)

- `GET /` - Lister tous les utilisateurs (admin)
- `GET /:id` - Obtenir un utilisateur par ID (admin)
- `PUT /profile` - Mettre à jour le profil utilisateur
- `PUT /password` - Changer le mot de passe
- `DELETE /:id` - Supprimer un utilisateur (admin)
- `PUT /:id/toggle-active` - Activer/désactiver un utilisateur (admin)

### Concerts (`/api/concerts`)

- `GET /` - Lister tous les concerts
- `GET /:id` - Obtenir un concert par ID
- `POST /` - Créer un nouveau concert (admin)
- `PUT /:id` - Mettre à jour un concert (admin)
- `DELETE /:id` - Supprimer un concert (admin)
- `GET /featured/list` - Lister les concerts en vedette
- `GET /cities/list` - Lister les villes avec des concerts

### Contenu (`/api/content`)

- `GET /portfolio` - Lister les éléments du portfolio
- `GET /portfolio/:id` - Obtenir un élément du portfolio
- `GET /band` - Obtenir les informations du groupe
- `GET /band/members` - Obtenir les membres du groupe
- `GET /band/discography` - Obtenir la discographie
- `POST /portfolio` - Créer un élément du portfolio (admin)
- `PUT /portfolio/:id` - Mettre à jour un élément du portfolio (admin)
- `DELETE /portfolio/:id` - Supprimer un élément du portfolio (admin)

## Comptes par défaut

Après exécution de `npm run seed-db` :

- **Email** : admin@vaguesderiffs.fr
- **Username** : admin
- **Password** : admin123
- **Role** : admin

⚠️ **Important** : Changez le mot de passe par défaut en production !

## Sécurité

- Les mots de passe sont hashés avec bcrypt (cost: 12)
- Tokens JWT pour l'authentification (expiration: 7 jours)
- Validation des entrées utilisateur
- Middleware d'authentification pour les routes protégées
- Rôles utilisateur (user/admin)
- Protection contre les injections SQL avec requêtes préparées

## Développement

- Mode développement avec `npm run dev` (nodemon)
- Mode production avec `npm start`
- Tests avec `npm test`

## Déploiement

### Variables d'environnement production

```env
NODE_ENV=production
DB_HOST=votre_host_mysql
DB_USER=votre_user_mysql
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=vagues_de_riffs
JWT_SECRET=votre_secret_key_tres_longue_et_complexe
```

### Commandes utiles

```bash
# Vérifier la connexion à la base de données
mysql -h localhost -u root -p vagues_de_riffs

# Sauvegarder la base de données
mysqldump -h localhost -u root -p vagues_de_riffs > backup.sql

# Restaurer la base de données
mysql -h localhost -u root -p vagues_de_riffs < backup.sql
```

Le serveur sert automatiquement les fichiers statiques du frontend depuis le dossier `../frontend`.
