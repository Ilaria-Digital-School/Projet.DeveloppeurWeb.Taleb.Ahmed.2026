const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const transporter = require('./utils/mailer');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import middleware
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const concertRoutes = require('./routes/concerts');
const contentRoutes = require('./routes/content');
const contactRoutes = require('./routes/contact');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// API Routes (doit être défini avant les routes statiques)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/concerts', concertRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => {
    res.json(swaggerSpec);
});

// Pour le développement: Angular tourne sur son propre serveur (port 4200)
// Pour la production: on sert les fichiers statiques du build Angular
if (process.env.NODE_ENV === 'production') {
    // Servir les fichiers statiques Angular
    app.use(express.static(path.join(__dirname, '../frontend/dist/frontend/browser')));
    
    // Pour le routing SPA: toutes les routes non-API retournent index.html
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../frontend/dist/frontend/browser/index.html'));
        }
    });
} else {
    // En développement: message informatif
    app.get('/', (req, res) => {
        res.json({
            message: 'Backend API Vagues de Riffs',
            frontend: 'Angular frontend should run on http://localhost:4200',
            api: 'API available at /api/*',
            docs: 'API documentation at /api/docs'
        });
    });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler pour les routes API
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route API non trouvée' 
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur: http://localhost:${PORT}/api`);
    console.log(`� Documentation API sur: http://localhost:${PORT}/api/docs`);
    console.log(`🗄️  Base de données: MySQL`);
    console.log(`📋 Logs disponibles dans le dossier /backend/logs`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🌐 Pour le développement, lancez Angular avec: cd ../frontend && ng serve --proxy-config proxy.conf.json`);
    }
});

module.exports = app;