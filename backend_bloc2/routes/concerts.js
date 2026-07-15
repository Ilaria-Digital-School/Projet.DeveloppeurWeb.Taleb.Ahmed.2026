const express = require('express');
const { body, validationResult } = require('express-validator');
const Concert = require('../models/ConcertMySQL');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation centralisée des concerts pour les créations et mises à jour.
const validateConcert = [
    body('title')
        .notEmpty()
        .withMessage('Le titre est requis')
        .trim(),
    body('venue.name')
        .notEmpty()
        .withMessage('Le nom de la salle est requis')
        .trim(),
    body('venue.address')
        .notEmpty()
        .withMessage("L'adresse est requise")
        .trim(),
    body('venue.city')
        .notEmpty()
        .withMessage('La ville est requise')
        .trim(),
    body('date')
        .isISO8601()
        .withMessage('La date est requise et doit etre valide'),
    body('time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("L'heure doit etre au format HH:MM"),
    body('price.min')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix minimum doit etre positif'),
    body('price.max')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Le prix maximum doit etre positif')
];

router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, city, upcoming } = req.query;
        // Supporte pagination et filtres pour éviter de renvoyer toute la collection.
        const { concerts, pagination } = await Concert.findAll({
            page,
            limit,
            status,
            city,
            upcoming
        });

        res.json({
            success: true,
            data: concerts.map((concert) => concert.toJSON()),
            pagination
        });
    } catch (error) {
        console.error('Erreur get concerts:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recuperation des concerts'
        });
    }
});

router.get('/featured/list', async (req, res) => {
    try {
        // Alimente les sections "concerts en vedette" du frontend.
        const concerts = await Concert.findFeatured(5);
        res.json({
            success: true,
            data: concerts.map((concert) => concert.toJSON())
        });
    } catch (error) {
        console.error('Erreur get featured concerts:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recuperation des concerts en vedette'
        });
    }
});

router.get('/cities/list', async (req, res) => {
    try {
        // Sert à construire des filtres de ville côté interface.
        const cities = await Concert.findCities();
        res.json({
            success: true,
            data: cities
        });
    } catch (error) {
        console.error('Erreur get cities:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recuperation des villes'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const concert = await Concert.findById(req.params.id);

        if (!concert) {
            return res.status(404).json({
                success: false,
                message: 'Concert non trouve'
            });
        }

        res.json({
            success: true,
            data: concert.toJSON()
        });
    } catch (error) {
        console.error('Erreur get concert:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recuperation du concert'
        });
    }
});

router.post('/', adminAuth, validateConcert, async (req, res) => {
    try {
        // On bloque la création si les contraintes métier minimales ne sont pas respectées.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        // Le modèle centralise la transformation entre le format reçu par l'API
        // et la structure réellement stockée en base.
        const concert = new Concert({
            title: req.body.title,
            venue: req.body.venue,
            date: req.body.date,
            time: req.body.time,
            price: req.body.price,
            description: req.body.description,
            status: req.body.status || 'upcoming',
            ticketUrl: req.body.ticketUrl,
            infoUrl: req.body.infoUrl,
            image: req.body.image,
            isFeatured: req.body.isFeatured,
            createdBy: req.userId
        });

        await concert.save();

        res.status(201).json({
            success: true,
            message: 'Concert cree avec succes',
            data: concert.toJSON()
        });
    } catch (error) {
        console.error('Erreur create concert:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la creation du concert'
        });
    }
});

router.put('/:id', adminAuth, validateConcert, async (req, res) => {
    try {
        // Même logique de validation qu'à la création pour conserver des données cohérentes.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const concert = await Concert.findById(req.params.id);
        if (!concert) {
            return res.status(404).json({
                success: false,
                message: 'Concert non trouve'
            });
        }

        // Mise à jour champ par champ pour conserver les valeurs existantes
        // lorsqu'une propriété n'est pas renvoyée par le client.
        concert.title = req.body.title;
        concert.venueName = req.body.venue?.name || concert.venueName;
        concert.venueAddress = req.body.venue?.address || concert.venueAddress;
        concert.venueCity = req.body.venue?.city || concert.venueCity;
        concert.venueCapacity = req.body.venue?.capacity ?? concert.venueCapacity;
        concert.date = req.body.date;
        concert.time = req.body.time;
        concert.priceMin = req.body.price?.min ?? concert.priceMin;
        concert.priceMax = req.body.price?.max ?? concert.priceMax;
        concert.priceCurrency = req.body.price?.currency || concert.priceCurrency;
        concert.description = req.body.description || concert.description;
        concert.status = req.body.status || concert.status;
        concert.ticketUrl = req.body.ticketUrl ?? concert.ticketUrl;
        concert.infoUrl = req.body.infoUrl ?? concert.infoUrl;
        concert.image = req.body.image ?? concert.image;
        concert.isFeatured = req.body.isFeatured ?? concert.isFeatured;

        await concert.save();

        res.json({
            success: true,
            message: 'Concert mis a jour avec succes',
            data: concert.toJSON()
        });
    } catch (error) {
        console.error('Erreur update concert:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise a jour du concert'
        });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    try {
        // Vérifie l'existence avant suppression pour renvoyer une erreur métier claire.
        const concert = await Concert.findById(req.params.id);
        if (!concert) {
            return res.status(404).json({
                success: false,
                message: 'Concert non trouve'
            });
        }

        await Concert.delete(req.params.id);

        res.json({
            success: true,
            message: 'Concert supprime avec succes'
        });
    } catch (error) {
        console.error('Erreur delete concert:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la suppression du concert'
        });
    }
});

module.exports = router;
