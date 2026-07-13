# 📚 API Documentation - Vagues de Riffs

Documentation complète de l'API REST pour le site web du groupe de rock "Vagues de Riffs".

## 🌐 Base URL

```
Development: http://localhost:3000/api
Production: https://vaguesderiffs.fr/api
```

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans l'en-tête :

```
Authorization: Bearer <votre_token_jwt>
```

### Inscription

```http
POST /api/auth/register
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "firstName": "Alexandre",
  "lastName": "Martin",
  "email": "alex.martin@email.com",
  "username": "alexrock",
  "password": "Password123!",
  "birthDate": "1990-01-01",
  "newsletter": true,
  "terms": "true"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": 1,
      "firstName": "Alexandre",
      "lastName": "Martin",
      "email": "alex.martin@email.com",
      "username": "alexrock",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-03-31T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Connexion

```http
POST /api/auth/login
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "email": "alex.martin@email.com",
  "password": "Password123!"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Obtenir le profil utilisateur

```http
GET /api/auth/me
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Alexandre",
    "lastName": "Martin",
    "email": "alex.martin@email.com",
    "username": "alexrock",
    "role": "user",
    "isActive": true,
    "lastLogin": "2024-03-31T10:00:00.000Z",
    "createdAt": "2024-03-31T10:00:00.000Z"
  }
}
```

### Déconnexion

```http
POST /api/auth/logout
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

## 👥 Utilisateurs (Admin uniquement)

### Lister tous les utilisateurs

```http
GET /api/users?page=1&limit=10&search=alex&role=user
Authorization: Bearer <token_admin>
```

**Paramètres :**
- `page` (optionnel) : Numéro de la page (défaut: 1)
- `limit` (optionnel) : Nombre d'utilisateurs par page (défaut: 10)
- `search` (optionnel) : Recherche dans nom, prénom, email, username
- `role` (optionnel) : Filtre par rôle (user/admin)

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "firstName": "Alexandre",
      "lastName": "Martin",
      "email": "alex.martin@email.com",
      "username": "alexrock",
      "role": "user",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Mettre à jour le profil

```http
PUT /api/users/profile
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "firstName": "Alex",
  "lastName": "Rock",
  "username": "alexrockv2",
  "newsletter": false
}
```

### Changer le mot de passe

```http
PUT /api/users/password
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "currentPassword": "AncienMotDePasse",
  "newPassword": "NouveauMotDePasse123!"
}
```

## 🎵 Concerts

### Lister tous les concerts

```http
GET /api/concerts?page=1&limit=10&status=upcoming&city=Paris&upcoming=true
```

**Paramètres :**
- `page` : Numéro de la page
- `limit` : Nombre de concerts par page
- `status` : upcoming/sold_out/cancelled/completed
- `city` : Filtre par ville
- `upcoming` : true pour les concerts à venir uniquement

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Vagues de Riffs - Lancement du Nouvel Album",
      "venue": {
        "name": "Olympia",
        "address": "28 Boulevard des Capucines",
        "city": "Paris",
        "capacity": 2000
      },
      "date": "2024-06-15",
      "time": "20:00",
      "price": {
        "min": 35.00,
        "max": 75.00,
        "currency": "EUR"
      },
      "status": "upcoming",
      "ticketUrl": "https://billetterie.vaguesderiffs.fr/olympia",
      "isFeatured": true
    }
  ]
}
```

### Créer un concert (Admin)

```http
POST /api/concerts
Authorization: Bearer <token_admin>
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "title": "Nouveau Concert",
  "venueName": "Le Bataclan",
  "venueAddress": "44 Avenue de la Grande Armée",
  "venueCity": "Lyon",
  "venueCapacity": 1500,
  "date": "2024-08-15",
  "time": "19:30",
  "priceMin": 45.00,
  "priceMax": 89.00,
  "description": "Soirée explosive dans une salle mythique",
  "ticketUrl": "https://billetterie.vaguesderiffs.fr/bataclan",
  "infoUrl": "https://vaguesderiffs.fr/bataclan"
}
```

### Concerts en vedette

```http
GET /api/concerts/featured/list
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Vagues de Riffs - Lancement du Nouvel Album",
      "isFeatured": true
    }
  ]
}
```

### Villes avec concerts

```http
GET /api/concerts/cities/list
```

**Réponse :**
```json
{
  "success": true,
  "data": ["Paris", "Lyon", "Marseille", "Lille", "Bordeaux"]
}
```

## 🎨 Contenu

### Portfolio

```http
GET /api/content/portfolio?category=album&featured=true
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Premier Album",
      "description": "Production/Enregistrement/Mixage",
      "image": "https://picsum.photos/seed/album1/400/300.jpg",
      "category": "album",
      "isFeatured": true
    }
  ]
}
```

### Informations du groupe

```http
GET /api/content/band
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "name": "Vagues de Riffs",
    "description": "Né dans les rues animées de Paris en 2018...",
    "members": [
      {
        "name": "Alexandre 'Alex' Martin",
        "role": "Chanteur / Guitariste",
        "bio": "Fondateur du groupe..."
      }
    ],
    "discography": [
      {
        "title": "Première Vague",
        "year": "2019",
        "type": "EP",
        "tracks": ["Vague d'Ouverture", "Résonance"]
      }
    ]
  }
}
```

## ❌ Codes d'erreur

| Code | Message | Description |
|------|----------|---------|
| 400 | Bad Request | Requête invalide |
| 401 | Unauthorized | Non authentifié ou token invalide |
| 403 | Forbidden | Accès réservé aux administrateurs |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Ressource déjà existante |
| 500 | Internal Server Error | Erreur serveur |

## 🔄 Format des réponses

Toutes les réponses API suivent ce format :

```json
{
  "success": true|false,
  "message": "Message descriptif",
  "data": {...}, // Présent uniquement si success: true
  "errors": [...] // Présent uniquement en cas d'erreur de validation
}
```

## 🛠️ Exemples d'utilisation

### JavaScript (Fetch)

```javascript
// Inscription
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'Alexandre',
    lastName: 'Martin',
    email: 'alex@email.com',
    username: 'alexrock',
    password: 'Password123!',
    birthDate: '1990-01-01',
    newsletter: true,
    terms: 'true'
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.data.token);
  // Rediriger vers la page d'accueil
}
```

### cURL

```bash
# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@email.com",
    "password": "Password123!"
  }'

# Lister les concerts (avec auth)
curl -X GET http://localhost:3000/api/concerts \
  -H "Authorization: Bearer <votre_token>"
```

## 📝 Notes importantes

- Tous les tokens JWT expirent après 7 jours
- Les mots de passe sont hashés avec bcrypt (cost: 12)
- Les logs sont sauvegardés dans `/backend/logs/`
- La base de données utilise UTF-8 (support complet français)
- Le serveur gère automatiquement le CORS pour le frontend

---

*Dernière mise à jour : 31 Mars 2024*
