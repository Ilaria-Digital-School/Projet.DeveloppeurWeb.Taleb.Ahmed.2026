# Guide de Démarrage - Vagues de Riffs

## 🚀 Architecture

Le projet utilise une architecture séparée frontend/backend:

- **Frontend**: Angular (port 4200)
- **Backend**: Node.js/Express (port 3000)
- **Base de données**: MySQL

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- npm (v9 ou supérieur)
- MySQL (v8 ou supérieur)

## 🔧 Installation

### 1. Installer les dépendances backend

```bash
cd backend_bloc2
npm install
```

### 2. Installer les dépendances frontend

```bash
cd ../frontend
npm install
```

## 🗄️ Configuration Base de Données

### 1. Créer la base de données MySQL

```sql
CREATE DATABASE vagues_de_riffs;
```

### 2. Configurer les variables d'environnement

Dans `backend_bloc2/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=vagues_de_riffs
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:4200
PORT=3000
NODE_ENV=development
```

### 3. Initialiser les tables

```bash
cd backend_bloc2
npm run init-db
```

## 🚀 Lancer le Projet

### Option 1: Développement (Recommandé)

Lancer les deux serveurs dans des terminaux séparés:

**Terminal 1 - Backend:**
```bash
cd backend_bloc2
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
ng serve --proxy-config proxy.conf.json
```

Ou utiliser le script npm:
```bash
cd frontend
npm start
```

### Option 2: Production

**1. Builder le frontend:**
```bash
cd frontend
ng build --configuration production
```

**2. Lancer le backend en mode production:**
```bash
cd backend_bloc2
NODE_ENV=production npm start
```

## 🌐 Accès aux Applications

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **Documentation API**: http://localhost:3000/api/docs

## 📡 Endpoints API Principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion

### Concerts
- `GET /api/concerts` - Liste des concerts
- `GET /api/concerts/featured/list` - Concerts en vedette
- `GET /api/concerts/:id` - Détails d'un concert

### Contenu
- `GET /api/content/band` - Informations du groupe
- `GET /api/content/band/members` - Membres
- `GET /api/content/portfolio` - Portfolio

### Contact
- `POST /api/contact/contact` - Formulaire de contact

## 🔧 Dépannage

### Le backend ne démarre pas

1. Vérifiez que MySQL est en cours d'exécution
2. Vérifiez le fichier `.env` dans `backend_bloc2`
3. Consultez les logs dans `backend_bloc2/logs`

### Le frontend ne communique pas avec le backend

1. Vérifiez que le backend est en cours d'exécution sur le port 3000
2. Vérifiez que le proxy est configuré (`proxy.conf.json`)
3. Vérifiez la console du navigateur pour les erreurs CORS

### Erreur "Cannot GET /login" ou autres routes

C'est normal ! Angular utilise le routing client-side. Assurez-vous:
1. Le frontend Angular est lancé sur le port 4200
2. Vous accédez à http://localhost:4200 (pas 3000)
3. Le routing Angular est configuré correctement

## 📝 Structure du Projet

```
bloc3/
├── backend_bloc2/          # Backend Node.js/Express
│   ├── config/           # Configuration DB et Swagger
│   ├── middleware/       # Middleware Express
│   ├── models/          # Modèles MySQL
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires (mailer, etc.)
│   └── server.js        # Point d'entrée backend
└── frontend/            # Frontend Angular
    ├── src/
    │   └── app/
    │       ├── components/  # Composants Angular
    │       ├── services/     # Services API
    │       └── ...
    ├── proxy.conf.json  # Configuration proxy dev
    └── angular.json    # Configuration Angular
```

## 🔐 Sécurité

- JWT pour l'authentification
- CORS configuré
- Validation des entrées
- Hashage des mots de passe avec bcrypt

## 📚 Documentation

- [Documentation Backend](./backend_bloc2/API-DOCUMENTATION.md)
- [Documentation Outil](./backend_bloc2/DOCUMENTATION-OUTIL.md)
- [Résumé Intégration](./INTEGRATION_SUMMARY.md)