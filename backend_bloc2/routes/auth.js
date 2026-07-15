const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/UserMySQL');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRegister = [
    body('firstName')
        .isLength({ min: 2 })
        .withMessage('Le prénom doit contenir au moins 2 caractères')
        .trim(),
    body('lastName')
        .isLength({ min: 2 })
        .withMessage('Le nom doit contenir au moins 2 caractères')
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Veuillez entrer un email valide')
        .normalizeEmail(),
    body('username')
        .isLength({ min: 3 })
        .withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères')
        .trim(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    body('birthDate')
        .isISO8601()
        .withMessage('Veuillez entrer une date de naissance valide')
        .custom(value => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 13) {
                throw new Error('Vous devez avoir au moins 13 ans pour vous inscrire');
            }
            return true;
        }),
    body('terms')
        .equals('true')
        .withMessage('Vous devez accepter les conditions d\'utilisation')
];

const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Veuillez entrer un email valide')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis')
];

// Register route
router.post('/register', validateRegister, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, username, password, birthDate, newsletter } = req.body;

        // Check if user already exists
        const existingUser = await User.existsByEmailOrUsername(email, username);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Cet email est déjà utilisé' : 'Ce nom d\'utilisateur est déjà utilisé'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            username,
            password,
            birthDate,
            newsletter: newsletter === 'true'
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: user.toProfileJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de l\'inscription'
        });
    }
});

// Login route
router.post('/login', validateLogin, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Votre compte a été désactivé'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: user.toProfileJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la connexion'
        });
    }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            data: user.toProfileJSON()
        });
    } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue'
        });
    }
});

// Logout route
router.post('/logout', auth, async (req, res) => {
    try {
        // In a real application, you might want to invalidate the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la déconnexion'
        });
    }
});

module.exports = router;
