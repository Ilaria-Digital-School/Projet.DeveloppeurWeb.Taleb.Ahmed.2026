const jwt = require('jsonwebtoken');
const User = require('../models/UserMySQL');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé - Token manquant'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' from string

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide - Utilisateur non trouvé'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Compte désactivé'
            });
        }

        // Add user to request object
        req.userId = decoded.userId;
        req.user = user;
        
        next();
    } catch (error) {
        console.error('Erreur auth middleware:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification'
        });
    }
};

// Middleware for admin-only routes
const adminAuth = async (req, res, next) => {
    try {
        // First run the regular auth middleware
        await auth(req, res, () => {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès réservé aux administrateurs'
                });
            }
            
            next();
        });
    } catch (error) {
        console.error('Erreur admin auth:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification admin'
        });
    }
};

module.exports = { auth, adminAuth };
