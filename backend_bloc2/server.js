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
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/concerts', concertRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => {
    res.json(swaggerSpec);
});

// Route to serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Handle frontend routes (SPA)
app.get('/biography', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/biography.html'));
});

app.get('/concerts', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/concerts.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/contact.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.post('/register', async (req, res) => {
    const { email, name } = req.body;

    const mailOptions = {
        from: '"Mon App Express" <noreply@monapp.com>',
        to: email,
        subject: 'Bienvenue !',
        html: `<h1>Salut ${name} !</h1><p>Ton compte est bien créé.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Utilisateur créé et mail envoyé à MailHog !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'envoi du mail" });
    }
});

app.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/user-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-dashboard.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route non trouvée' 
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🌐 Frontend disponible sur: http://localhost:${PORT}`);
    console.log(`📡 API disponible sur: http://localhost:${PORT}/api`);
    console.log(`🗄️  Base de données: MySQL`);
    console.log('📋 Logs disponibles dans le dossier /backend/logs');
});

module.exports = app;
