# Guide de Dépannage - Vagues de Riffs

## ❌ Problème: "Cannot GET /" ou autres routes

### 🔍 Causes possibles

1. **Vous n'avez pas lancé le frontend Angular**
2. **Vous accédez à la mauvaise URL**
3. **Angular ne s'est pas correctement compilé**
4. **Le backend essaie de servir les fichiers Angular**

### ✅ Solutions

#### Solution 1: Vérifiez que vous lancez le bon serveur

**❌ NE PAS ACCÉDER À http://localhost:3000**
Le backend (port 3000) est uniquement pour l'API, pas pour le frontend.

**✅ ACCÉDER À http://localhost:4200**
Le frontend Angular tourne sur le port 4200.

#### Solution 2: Lancez les serveurs correctement

**Terminal 1 - Backend:**
```bash
cd backend_bloc2
npm run dev
```
Vous devriez voir: `🚀 Serveur backend démarré sur le port 3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
ng serve --proxy-config proxy.conf.json
```
Vous devriez voir: `Angular Live Development Server is listening on localhost:4200`

#### Solution 3: Vérifiez la bonne URL

Ouvrez votre navigateur et accédez à:
- **http://localhost:4200** (racine - redirige vers /home)
- **http://localhost:4200/home** (page d'accueil)
- **http://localhost:4200/login** (page de connexion)
- **http://localhost:4200/register** (page d'inscription)
- **http://localhost:4200/concerts** (page des concerts)
- **http://localhost:4200/biography** (page biographie)
- **http://localhost:4200/contact** (page contact)

#### Solution 4: Nettoyez et recompilez Angular

Si Angular ne se compile pas correctement:

```bash
cd frontend
rm -rf node_modules dist
npm install
ng serve --proxy-config proxy.conf.json
```

Sur Windows:
```bash
cd frontend
rmdir /s /q node_modules dist
npm install
ng serve --proxy-config proxy.conf.json
```

## ❌ Erreurs dans la console Chrome DevTools

### Erreur: "Uncaught Error: No Listener: tabs:outgoing.message.ready"
**⚠️ CE N'EST PAS CRITIQUE** - Cette erreur est liée aux extensions Chrome ou DevTools.

**Solution**: Ignorez cette erreur. Elle n'affecte pas le fonctionnement de l'application.

### Erreur: "Connecting to ... violates Content Security Policy"
**⚠️ CE N'EST PAS CRITIQUE** - C'est Chrome DevTools qui essaie de se connecter.

**Solution**: Cette erreur a été corrigée en modifiant le CSP dans index.html. Rechargez la page.

## ❌ Erreur CORS dans la console

### Symptôme: "Access to XMLHttpRequest at 'http://localhost:3000/api/...' from origin 'http://localhost:4200' has been blocked by CORS policy"

**Solution:**
1. Vérifiez que le backend est en cours d'exécution
2. Vérifiez que le proxy est configuré dans `frontend/proxy.conf.json`
3. Vérifiez le CORS dans `backend_bloc2/server.js` (déjà configuré)

## ❌ Les données de l'API ne chargent pas

### Symptôme: Les pages restent vides ou affichent "Erreur de connexion au serveur"

**Solution:**
1. Vérifiez que le backend tourne: http://localhost:3000/api
2. Vérifiez la console du navigateur pour les erreurs réseau
3. Vérifiez que la base de données MySQL est en cours d'exécution
4. Consultez les logs backend dans `backend_bloc2/logs`

## ❌ Erreur de compilation Angular

### Symptôme: Erreurs TypeScript lors du `ng serve`

**Solution:**
1. Corrigez les erreurs TypeScript signalées
2. Si nécessaire, utilisez `--aot=false` pour désactiver l'AOT:
   ```bash
   ng serve --proxy-config proxy.conf.json --aot=false
   ```

## 🧪 Test de l'installation

### Test 1: Backend API
Ouvrez dans le navigateur: `http://localhost:3000/api`

Vous devriez voir:
```json
{
  "message": "Backend API Vagues de Riffs",
  "frontend": "Angular frontend should run on http://localhost:4200",
  "api": "API available at /api/*",
  "docs": "API documentation at /api/docs"
}
```

### Test 2: Documentation API
Ouvrez dans le navigateur: `http://localhost:3000/api/docs`

Vous devriez voir l'interface Swagger UI.

### Test 3: Frontend
Ouvrez dans le navigateur: `http://localhost:4200`

Vous devriez voir la page d'accueil de Vagues de Riffs.

## 📞 Besoin d'aide ?

Si vous rencontrez toujours des problèmes:

1. **Consultez les logs backend**: `backend_bloc2/logs/`
2. **Vérifiez la console du navigateur** (F12)
3. **Vérifiez le terminal Angular** pour les erreurs de compilation
4. **Assurez-vous que MySQL est en cours d'exécution**

## 🔄 Commandes utiles

### Redémarrer le backend
```bash
cd backend_bloc2
npm run dev
```

### Redémarrer le frontend
```bash
cd frontend
ng serve --proxy-config proxy.conf.json
```

### Vérifier les processus en cours
```bash
# Sur Windows
netstat -ano | findstr :3000
netstat -ano | findstr :4200

# Sur Mac/Linux  
lsof -i :3000
lsof -i :4200
```

## 🎯 Checklist avant de demander de l'aide

- [ ] Backend en cours d'exécution sur le port 3000
- [ ] Frontend en cours d'exécution sur le port 4200
- [ ] MySQL en cours d'exécution
- [ ] Accès via http://localhost:4200 (pas 3000)
- [ ] Pas d'erreurs de compilation Angular
- [ ] Console du navigateur vérifiée
- [ ] Logs backend consultés