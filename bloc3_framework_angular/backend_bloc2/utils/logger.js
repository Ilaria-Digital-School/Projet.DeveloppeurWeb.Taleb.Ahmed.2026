const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logger utility
const logger = {
    info: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message,
            ...meta
        };
        writeLog(logEntry);
    },

    warn: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'warn',
            message,
            ...meta
        };
        writeLog(logEntry);
    },

    error: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message,
            ...meta
        };
        writeLog(logEntry);
    },

    debug: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'debug',
            message,
            ...meta
        };
        writeLog(logEntry);
    }
};

function writeLog(logEntry) {
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';
    
    fs.appendFile(logFile, logLine, (err) => {
        if (err) {
            console.error('Erreur d\'écriture du log:', err);
        }
    });
}

// Custom error classes
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
        this.statusCode = 401;
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

module.exports = {
    logger,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
};
