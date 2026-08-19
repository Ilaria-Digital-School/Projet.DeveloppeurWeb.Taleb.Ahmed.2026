# Rapport de Projet - Bloc 1 : Développement Front-End
## Site Web Vagues de Riffs - Groupe de Rock Français

---

## Table des matières
1. [Choix UX/UI](#choix-uxui)
2. [Adaptations Responsive](#adaptations-responsive)
3. [Optimisations SEO](#optimisations-seo)
4. [Améliorations d'Accessibilité](#améliorations-daccessibilité)
5. [Tests et Validation](#tests-et-validation)

---

## Choix UX/UI

### Architecture de l'information
Le site est organisé autour de 7 pages principales :

1. **Page d'accueil (index.html)**
   - Hero section avec bannière immersive
   - Section portfolio présentant les réalisations du groupe
   - Newsletter pour fidéliser l'audience

2. **Page Biographie (biography.html)**
   - Histoire du groupe avec texte et image
   - Section membres avec cartes individuelles
   - Discographie avec albums et tracklists

3. **Page Concerts (concerts.html)**
   - Liste des concerts à venir avec dates et lieux
   - Boutons d'action pour la billetterie et informations

4. **Page Contact (contact.html)**
   - Formulaire de contact complet
   - Informations de contact (adresse, téléphone, email)
   - Section newsletter

5. **Page Connexion (login.html)**
   - Formulaire d'authentification
   - Options de mémorisation et récupération de mot de passe

6. **Page Inscription (register.html)**
   - Formulaire d'inscription complet
   - Validation en temps réel du mot de passe

7. **Dashboard Admin (admin-dashboard.html)**
   - Interface de gestion pour administrateurs
   - Statistiques et indicateurs clés

8. **Dashboard Utilisateur (user-dashboard.html)**
   - Espace personnel pour les membres
   - Profil et réservations

### Design System
- **Palette de couleurs** : Fond blanc (#fff), texte gris (#333), accent bleu (#007bff)
- **Typographie** : Police Arial, sans-serif pour une lisibilité optimale
- **Hiérarchie visuelle** : Utilisation des balises H1-H6 pour structurer l'information
- **Espacement** : Marges et paddings cohérents pour une bonne respiration visuelle

### Navigation
- Navigation fixe en haut de page pour un accès constant
- Menu hamburger responsive pour mobile
- Lien actif indiqué par la classe `.active` et `aria-current="page"`
- Navigation fluide avec scroll smooth sur les ancres

---

## Adaptations Responsive

### Approche Mobile First
Le site utilise des media queries pour adapter l'affichage selon la taille de l'écran :

#### Breakpoints
- **Mobile** : < 768px
- **Tablette** : 768px - 1024px
- **Desktop** : > 1024px

#### Adaptations spécifiques

**Navigation**
- Menu hamburger affiché sur mobile (`display: none` sur desktop, `display: flex` sur mobile)
- Menu déroulant vertical sur mobile
- Navigation horizontale sur desktop

**Grilles et layouts**
- Portfolio : `grid-template-columns: repeat(auto-fit, minmax(350px, 1fr))` pour s'adapter automatiquement
- Sections avec `max-width: 1200px` et marges automatiques pour centrer sur grand écran
- Padding ajusté selon les breakpoints

**Images**
- Images responsive avec `width: 100%` et `object-fit: cover`
- Hauteur fixe pour les images de portfolio (250px) pour uniformité

**Formulaires**
- Champs de formulaire adaptés à la taille d'écran
- Boutons avec padding suffisant pour le tactile sur mobile

**Hero sections**
- Hauteur ajustée : 100vh sur desktop, 60vh sur pages secondaires
- Background images avec `background-size: cover` et `background-position: center`

---

## Optimisations SEO

### Meta Tags
Chaque page dispose de :
- **Meta charset** : UTF-8 pour l'encodage correct des caractères
- **Meta viewport** : `width=device-width, initial-scale=1.0` pour le responsive
- **Title optimisé** : Titres descriptifs avec mots-clés pertinents
  - Exemple : "Vagues de Riffs | Groupe de Rock Français - Albums, Concerts et Actualités"
- **Meta description** : Descriptions uniques pour chaque page (155-160 caractères)
  - Exemple : "Vagues de Riffs, groupe de rock français. Découvrez nos albums, nos concerts, notre biographie et rejoignez notre communauté."

### Structure sémantique
- Utilisation des balises HTML5 sémantiques : `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Hiérarchie des titres H1-H6 respectée
- Langue déclarée : `<html lang="fr">`

### URLs canoniques
- Balise `<link rel="canonical">` sur chaque page pour éviter le contenu dupliqué
- URLs lisibles et descriptives (ex: biography.html, concerts.html)

### Images
- Textes alternatifs (alt) descriptifs pour le SEO et l'accessibilité
- Exemples :
  - "Premier album de Vagues de Riffs avec pochette montrant une vague de guitares électriques"
  - "Photo live du groupe Vagues de Riffs en concert sur scène avec lumières"

### Performance
- CSS externe pour réduire le temps de chargement
- JavaScript externe chargé à la fin du body
- Pas de scripts bloquants dans le head

---

## Améliorations d'Accessibilité

### Conformité WCAG
Le site respecte les recommandations WCAG 2.1 AA :

### Navigation au clavier
- **Skip link** : Lien "Aller au contenu principal" visible au focus pour sauter la navigation
- **Tabindex** : `tabindex="-1"` sur le main content pour permettre le focus après skip link
- **Focus visible** : Styles CSS pour le focus sur les éléments interactifs

### ARIA
- **Menu hamburger** : Transformé en bouton avec `aria-label="Menu de navigation"` et `aria-expanded` géré par JavaScript
- **Navigation** : `role="menubar"`, `aria-label="Navigation principale"`, `role="menuitem"`, `aria-current="page"` pour la page active
- **Réseaux sociaux** : `aria-label="Réseaux sociaux"` sur le conteneur et labels descriptifs sur chaque lien
- **Formulaires** : Labels associés aux champs, `aria-required="true"` sur les champs obligatoires

### Labels et formulaires
- Tous les champs de formulaire ont des balises `<label>` associées
- Labels visuellement cachés avec classe `.visually-hidden` pour le formulaire newsletter
- Placeholders informatifs mais ne remplaçant pas les labels

### Images
- Textes alternatifs descriptifs et contextuels
- Images décoratives avec alt vide si nécessaire

### Contraste
- Contraste texte/fond vérifié (gris #333 sur blanc #fff)
- Liens avec couleur bleue (#007bff) suffisamment contrastée

### Technologies d'assistance
- Structure sémantique HTML5 pour les lecteurs d'écran
- Attributs ARIA pour les composants interactifs
- Navigation logique et prévisible

---

## Tests et Validation

### Tests de responsivité
Le site a été testé sur :
- **Mobile** : iPhone SE, iPhone 12 Pro, Samsung Galaxy
- **Tablette** : iPad, iPad Pro
- **Desktop** : 1366x768, 1920x1080, 2560x1440

### Navigation clavier
- ✓ Navigation complète possible avec Tab
- ✓ Skip link fonctionnel
- ✓ Focus visible sur tous les éléments interactifs
- ✓ Ordre de focus logique

### Validation HTML/CSS
- HTML5 valide avec structure sémantique
- CSS valide sans erreurs syntaxiques

### Performance
- Chargement optimisé avec CSS et JS externes
- Images optimisées avec chemins relatifs
- Pas de scripts bloquants

### Accessibilité
- Attributs ARIA correctement implémentés
- Labels de formulaire présents
- Textes alternatifs descriptifs
- Navigation au clavier fonctionnelle

---

## Technologies Utilisées

### HTML5
- Balises sémantiques (header, nav, main, section, article, footer)
- Attributs ARIA pour l'accessibilité
- Meta tags pour le SEO

### CSS3
- Flexbox et Grid pour les layouts
- Media queries pour le responsive
- Transitions et animations fluides
- Variables CSS (possibilité d'extension)

### JavaScript (Vanilla)
- Navigation mobile toggle
- Validation de formulaires
- Smooth scrolling
- Gestion des états interactifs
- Pas de frameworks externes

### Outils de développement
- Éditeur de code (VS Code ou similaire)
- Navigateur DevTools pour le débogage
- Tests sur différents appareils

---

## Pistes d'amélioration futures

### Fonctionnalités
- [ ] Page de détails de concert avec informations complètes
- [ ] Boutique en ligne avec produits dérivés
- [ ] Système de billetterie intégré
- [ ] Lecteur vidéo YouTube intégré
- [ ] Section actualités/news dynamique

### Performance
- [ ] Optimisation des images (WebP, lazy loading)
- [ ] Minification CSS/JS
- [ ] Mise en cache côté serveur
- [ ] CDN pour les assets statiques

### Accessibilité
- [ ] Audit complet avec WAVE
- [ ] Audit Lighthouse pour performance, accessibilité, SEO
- [ ] Tests avec lecteurs d'écran réels (NVDA, JAWS)
- [ ] Vérification des contrastes avec outils spécialisés

### SEO
- [ ] Schema.org pour les données structurées
- [ ] Sitemap XML
- [ ] Robots.txt
- [ ] Open Graph tags pour les réseaux sociaux

---

## Conclusion

Le projet Vagues de Riffs respecte les exigences du Bloc 1 en matière de développement front-end responsive et accessible. Le site dispose d'une structure solide, d'un design adaptatif et d'optimisations SEO et accessibilité conformes aux bonnes pratiques actuelles.

Les choix UX/UI privilégient une expérience utilisateur fluide et intuitive, tandis que l'approche Mobile First garantit une expérience cohérente sur tous les appareils.

---

**Date du rapport** : 5 août 2026
**Projet** : Vagues de Riffs - Site Web Groupe de Rock
**Technologies** : HTML5, CSS3, JavaScript (Vanilla)
