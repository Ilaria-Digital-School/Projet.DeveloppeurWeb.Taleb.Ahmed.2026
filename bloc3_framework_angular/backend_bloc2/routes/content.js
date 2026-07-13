const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Données temporaires utilisées comme faux CMS tant que le contenu
// n'est pas encore entièrement branché sur la base de données.
const portfolioItems = [
    {
        id: 1,
        title: "Premier Album",
        description: "Production/Enregistrement/Mixage",
        image: "https://picsum.photos/seed/album1/400/300.jpg",
        category: "album",
        featured: true
    },
    {
        id: 2,
        title: "Tournée 2023",
        description: "Live/Production/Scénographie",
        image: "https://picsum.photos/seed/concert1/400/300.jpg",
        category: "concert",
        featured: true
    },
    {
        id: 3,
        title: "Clip Vidéo",
        description: "Réalisation/Montage/Post-production",
        image: "https://picsum.photos/seed/clip1/400/300.jpg",
        category: "video",
        featured: false
    },
    {
        id: 4,
        title: "Session Studio",
        description: "Enregistrement/Mixage/Mastering",
        image: "https://picsum.photos/seed/studio1/400/300.jpg",
        category: "studio",
        featured: false
    },
    {
        id: 5,
        title: "Festival Rock",
        description: "Performance/Production/Événementiel",
        image: "https://picsum.photos/seed/festival1/400/300.jpg",
        category: "festival",
        featured: true
    },
    {
        id: 6,
        title: "Session Acoustique",
        description: "Enregistrement/Live/Production",
        image: "https://picsum.photos/seed/acoustic1/400/300.jpg",
        category: "acoustic",
        featured: false
    }
];

const bandInfo = {
    name: "Vagues de Riffs",
    description: "Né dans les rues animées de Paris en 2018, Vagues de Riffs est bien plus qu'un simple groupe de rock. C'est une véritable vague sonore qui déferle sur la scène musicale française.",
    members: [
        {
            name: "Alexandre 'Alex' Martin",
            role: "Chanteur / Guitariste",
            bio: "Fondateur du groupe et compositeur principal, Alex est l'âme de Vagues de Riffs."
        },
        {
            name: "Lucas Dubois",
            role: "Guitariste Solo",
            bio: "Avec ses riffs électrisants et ses solos techniques, Lucas apporte l'énergie brute du groupe."
        },
        {
            name: "Marie Petit",
            role: "Bassiste",
            bio: "Marie est le fondement rythmique du groupe avec ses lignes de basse mélodiques."
        },
        {
            name: "Thomas Leroy",
            role: "Batteur",
            bio: "La force motrice derrière le son puissant du groupe."
        }
    ],
    discography: [
        {
            title: "Première Vague",
            year: "2019",
            type: "EP",
            tracks: ["Vague d'Ouverture", "Résonance", "Écho Urbain", "Marée Haute", "Calme Avant la Tempête"]
        },
        {
            title: "Résonances",
            year: "2021",
            type: "Album",
            tracks: ["L'Appel du Rock", "Dans les Rues de Paris", "Vagues de Riffs", "Nuits Électriques"]
        }
    ]
};

// Retourne le portfolio avec filtres optionnels par catégorie et mise en avant.
router.get('/portfolio', async (req, res) => {
    try {
        const { category, featured } = req.query;
        
        let filteredItems = [...portfolioItems];
        
        if (category) {
            filteredItems = filteredItems.filter(item => item.category === category);
        }
        
        if (featured === 'true') {
            filteredItems = filteredItems.filter(item => item.featured);
        }

        res.json({
            success: true,
            data: filteredItems
        });
    } catch (error) {
        console.error('Erreur get portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération du portfolio'
        });
    }
});

// Retourne un élément précis du portfolio.
router.get('/portfolio/:id', async (req, res) => {
    try {
        const item = portfolioItems.find(item => item.id === parseInt(req.params.id));
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Élément du portfolio non trouvé'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Erreur get portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération de l\'élément'
        });
    }
});

// Retourne les informations globales du groupe.
router.get('/band', async (req, res) => {
    try {
        res.json({
            success: true,
            data: bandInfo
        });
    } catch (error) {
        console.error('Erreur get band info:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des informations du groupe'
        });
    }
});

// Route dédiée pour afficher uniquement les membres du groupe.
router.get('/band/members', async (req, res) => {
    try {
        res.json({
            success: true,
            data: bandInfo.members
        });
    } catch (error) {
        console.error('Erreur get members:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des membres'
        });
    }
});

// Expose la discographie pour le frontend ou une future API publique.
router.get('/band/discography', async (req, res) => {
    try {
        res.json({
            success: true,
            data: bandInfo.discography
        });
    } catch (error) {
        console.error('Erreur get discography:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération de la discographie'
        });
    }
});

// Création protégée par rôle admin pour simuler une gestion de contenu.
router.post('/portfolio', adminAuth, [
    body('title')
        .notEmpty()
        .withMessage('Le titre est requis')
        .trim(),
    body('description')
        .notEmpty()
        .withMessage('La description est requise')
        .trim(),
    body('category')
        .isIn(['album', 'concert', 'video', 'studio', 'festival', 'acoustic'])
        .withMessage('La catégorie n\'est pas valide'),
    body('image')
        .isURL()
        .withMessage('L\'image doit être une URL valide')
], async (req, res) => {
    try {
        // Le backend valide les champs avant toute modification des données.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const newItem = {
            id: portfolioItems.length + 1,
            ...req.body,
            featured: false
        };

        portfolioItems.push(newItem);

        res.status(201).json({
            success: true,
            message: 'Élément du portfolio créé avec succès',
            data: newItem
        });
    } catch (error) {
        console.error('Erreur create portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la création de l\'élément'
        });
    }
});

// Mise à jour partielle d'un élément existant du portfolio.
router.put('/portfolio/:id', adminAuth, [
    body('title')
        .optional()
        .trim(),
    body('description')
        .optional()
        .trim(),
    body('category')
        .optional()
        .isIn(['album', 'concert', 'video', 'studio', 'festival', 'acoustic'])
        .withMessage('La catégorie n\'est pas valide'),
    body('image')
        .optional()
        .isURL()
        .withMessage('L\'image doit être une URL valide')
], async (req, res) => {
    try {
        // Les validations optionnelles évitent d'enregistrer des champs invalides.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const itemIndex = portfolioItems.findIndex(item => item.id === parseInt(req.params.id));
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Élément du portfolio non trouvé'
            });
        }

        // Fusionne uniquement les champs transmis par le client.
        Object.assign(portfolioItems[itemIndex], req.body);

        res.json({
            success: true,
            message: 'Élément du portfolio mis à jour avec succès',
            data: portfolioItems[itemIndex]
        });
    } catch (error) {
        console.error('Erreur update portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise à jour de l\'élément'
        });
    }
});

// Suppression dans la structure mockée, à remplacer plus tard par une suppression SQL.
router.delete('/portfolio/:id', adminAuth, async (req, res) => {
    try {
        const itemIndex = portfolioItems.findIndex(item => item.id === parseInt(req.params.id));
        
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Élément du portfolio non trouvé'
            });
        }

        portfolioItems.splice(itemIndex, 1);

        res.json({
            success: true,
            message: 'Élément du portfolio supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur delete portfolio item:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la suppression de l\'élément'
        });
    }
});

module.exports = router;
