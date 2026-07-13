const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    
    // Log error details
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    });

    // Default error response
    error.statusCode = error.statusCode || 500;
    error.message = error.message || 'Une erreur interne est survenue';

    // Handle specific error types
    if (error.name === 'ValidationError') {
        error.statusCode = 400;
        error.message = 'Erreurs de validation des données';
    } else if (error.name === 'UnauthorizedError') {
        error.statusCode = 401;
        error.message = 'Accès non autorisé';
    } else if (error.name === 'ForbiddenError') {
        error.statusCode = 403;
        error.message = 'Accès interdit';
    } else if (error.name === 'NotFoundError') {
        error.statusCode = 404;
        error.message = 'Ressource non trouvée';
    } else if (error.name === 'ConflictError') {
        error.statusCode = 409;
        error.message = 'Conflit de données';
    } else if (error.code === 'ER_DUP_ENTRY') {
        error.statusCode = 409;
        error.message = 'Cette ressource existe déjà';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
        error.statusCode = 500;
        error.message = 'Erreur de base de données - Table non trouvée';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        error.statusCode = 403;
        error.message = 'Accès à la base de données refusé';
    }

    // Don't send error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const errorResponse = {
        success: false,
        message: error.message,
        ...(isDevelopment && {
            error: {
                name: error.name,
                code: error.code,
                stack: error.stack
            }
        })
    };

    res.status(error.statusCode).json(errorResponse);
};

module.exports = errorHandler;
