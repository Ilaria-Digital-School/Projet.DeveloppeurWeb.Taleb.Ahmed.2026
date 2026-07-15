# Outil de documentation du projet

Un espace de documentation Swagger a ete ajoute au backend pour documenter l API du projet.

## Acces

Une fois le serveur lance, la documentation est disponible ici :

- `http://localhost:3000/api/docs`
- `http://localhost:3000/api/docs.json`

## Ce que l outil permet

- visualiser les routes principales de l API
- voir les methodes HTTP (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`)
- consulter les parametres et les corps de requete
- voir les schemas utilises pour l authentification, les concerts, le contact et le contenu
- tester les endpoints directement depuis l interface Swagger

## Routes documentees

- `Auth`
- `Concerts`
- `Content`
- `Contact`

## Comment l utiliser

1. Aller dans le dossier `backend`
2. Lancer le serveur avec `npm run dev` ou `npm start`
3. Ouvrir `http://localhost:3000/api/docs`

## Fichiers ajoutes / modifies

- `backend/config/swagger.js`
- `backend/server.js`

## Evolution possible

Plus tard, on pourra :

- proteger certaines routes Swagger par authentification
- documenter aussi les routes `users`
- ajouter des exemples de reponses plus detailles
- passer a une documentation automatique basee sur des annotations JSDoc dans chaque route
