const { logger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request details
    logger.info({
        message: 'Incoming request',
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        body: req.method !== 'GET' ? req.body : undefined,
        query: req.query
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        logger.info({
            message: 'Request completed',
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id
        });

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = requestLogger;
