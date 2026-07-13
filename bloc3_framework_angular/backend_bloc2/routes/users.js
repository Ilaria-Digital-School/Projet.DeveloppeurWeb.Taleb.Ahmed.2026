const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/UserMySQL');
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/admin/dashboard', adminAuth, async (req, res) => {
    try {
        const [
            userCountRows,
            weeklyUserCountRows,
            concertCountRows,
            featuredConcertRows,
            contactCountRows,
            unreadContactRows,
            newsletterCountRows,
            recentUsersRows,
            recentPortfolioRows,
            recentMessagesRows
        ] = await Promise.all([
            db.query('SELECT COUNT(*) AS total FROM users'),
            db.query('SELECT COUNT(*) AS total FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)'),
            db.query('SELECT COUNT(*) AS total FROM concerts'),
            db.query('SELECT COUNT(*) AS total FROM concerts WHERE is_featured = 1'),
            db.query('SELECT COUNT(*) AS total FROM contact_messages'),
            db.query("SELECT COUNT(*) AS total FROM contact_messages WHERE status = 'new'"),
            db.query('SELECT COUNT(*) AS total FROM users WHERE newsletter = 1'),
            db.query(`
                SELECT id, firstName, lastName, email, role, isActive, createdAt
                FROM users
                ORDER BY createdAt DESC
                LIMIT 5
            `),
            db.query(`
                SELECT id, title, category, is_featured, createdAt
                FROM portfolio
                ORDER BY createdAt DESC
                LIMIT 5
            `),
            db.query(`
                SELECT id, name, subject, status, createdAt
                FROM contact_messages
                ORDER BY createdAt DESC
                LIMIT 5
            `)
        ]);

        const totalUsers = userCountRows[0]?.total || 0;
        const newUsersThisWeek = weeklyUserCountRows[0]?.total || 0;
        const totalConcerts = concertCountRows[0]?.total || 0;
        const featuredConcerts = featuredConcertRows[0]?.total || 0;
        const totalMessages = contactCountRows[0]?.total || 0;
        const unreadMessages = unreadContactRows[0]?.total || 0;
        const newsletterSubscribers = newsletterCountRows[0]?.total || 0;

        const recentUsers = recentUsersRows.map((user) => ({
            id: user.id,
            fullName: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            role: user.role,
            isActive: Boolean(user.isActive),
            createdAt: user.createdAt
        }));

        const recentPortfolio = recentPortfolioRows.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            isFeatured: Boolean(item.is_featured),
            createdAt: item.createdAt
        }));

        const recentMessages = recentMessagesRows.map((message) => ({
            id: message.id,
            name: message.name,
            subject: message.subject,
            status: message.status,
            createdAt: message.createdAt
        }));

        res.json({
            success: true,
            data: {
                metrics: {
                    totalUsers,
                    newUsersThisWeek,
                    totalConcerts,
                    featuredConcerts,
                    totalMessages,
                    unreadMessages,
                    newsletterSubscribers
                },
                recentUsers,
                recentPortfolio,
                recentMessages,
                alerts: [
                    `${unreadMessages} message(s) de contact non lus`,
                    `${featuredConcerts} concert(s) actuellement en vedette`,
                    `${newUsersThisWeek} nouvel/nouveaux utilisateur(s) cette semaine`
                ]
            }
        });
    } catch (error) {
        console.error('Erreur dashboard admin:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recuperation du dashboard admin'
        });
    }
});

router.get('/', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role } = req.query;
        const { users, pagination } = await User.findAll({ page, limit, search, role });

        res.json({
            success: true,
            data: users.map((user) => user.toProfileJSON()),
            pagination
        });
    } catch (error) {
        console.error('Erreur get users:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recuperation des utilisateurs'
        });
    }
});

router.get('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
        }

        res.json({
            success: true,
            data: user.toProfileJSON()
        });
    } catch (error) {
        console.error('Erreur get user:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la recuperation de l utilisateur'
        });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, lastName, username, newsletter } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
        }

        if (username && username !== user.username) {
            const existingUser = await User.findByUsername(username);
            if (existingUser && existingUser.id !== user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Ce nom d utilisateur est deja utilise'
                });
            }
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (username) user.username = username;
        if (newsletter !== undefined) {
            user.newsletter = newsletter === true || newsletter === 'true' || newsletter === 1;
        }

        user.updatedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Profil mis a jour avec succes',
            data: user.toProfileJSON()
        });
    } catch (error) {
        console.error('Erreur update profile:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise a jour du profil'
        });
    }
});

router.put('/password', auth, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Le mot de passe actuel est requis'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe actuel est incorrect'
            });
        }

        user.password = newPassword;
        user.updatedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Mot de passe mis a jour avec succes'
        });
    } catch (error) {
        console.error('Erreur change password:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise a jour du mot de passe'
        });
    }
});

router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Impossible de supprimer un compte administrateur'
            });
        }

        await User.delete(req.params.id);

        res.json({
            success: true,
            message: 'Utilisateur supprime avec succes'
        });
    } catch (error) {
        console.error('Erreur delete user:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la suppression de l utilisateur'
        });
    }
});

router.put('/:id/toggle-active', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Impossible de desactiver un compte administrateur'
            });
        }

        const nextStatus = !user.isActive;
        await User.toggleActive(user.id, nextStatus);

        res.json({
            success: true,
            message: `Utilisateur ${nextStatus ? 'active' : 'desactive'} avec succes`,
            data: {
                id: user.id,
                isActive: nextStatus
            }
        });
    } catch (error) {
        console.error('Erreur toggle user:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise a jour du statut'
        });
    }
});

module.exports = router;
