const express = require('express');
const { body, validationResult } = require('express-validator');
const transporter = require('../utils/mailer');
const db = require('../config/database');

const router = express.Router();

// Détecte si le client attend une réponse HTML ou JSON.
const prefersHtml = (req) => {
    const acceptHeader = req.get('accept') || '';
    return acceptHeader.includes('text/html');
};

// Règles de validation centralisées pour le formulaire de contact.
const validateContact = [
    body('name')
        .isLength({ min: 2 })
        .withMessage('Le nom doit contenir au moins 2 caractères')
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Veuillez entrer un email valide')
        .normalizeEmail(),
    body('subject')
        .isLength({ min: 3 })
        .withMessage('Le sujet doit contenir au moins 3 caractères')
        .trim(),
    body('message')
        .isLength({ min: 10 })
        .withMessage('Le message doit contenir au moins 10 caractères')
        .trim()
];

// Enregistre le message puis envoie une notification à l'équipe
// et un email de confirmation à l'utilisateur.
router.post('/contact', validateContact, async (req, res) => {
    try {
        // Stoppe immédiatement le traitement si les données sont invalides.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (prefersHtml(req)) {
                return res.status(400).send('Erreurs de validation du formulaire de contact.');
            }

            return res.status(400).json({
                success: false,
                message: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const { name, email, subject, message } = req.body;

        // Sauvegarde du message pour l'historique et le suivi côté admin.
        const sql = `
            INSERT INTO contact_messages (name, email, subject, message, createdAt)
            VALUES (?, ?, ?, ?, NOW())
        `;
        await db.query(sql, [name, email, subject, message]);

        // Email interne pour prévenir l'équipe qu'un nouveau message est arrivé.
        const adminMailOptions = {
            from: `"Vagues de Riffs - Contact" <noreply@vaguesderiffs.fr>`,
            to: 'contact@vaguesderiffs.fr',
            subject: `Nouveau message de contact: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Vagues de Riffs</h1>
                        <p style="margin: 5px 0;">Nouveau message de contact</p>
                    </div>
                    
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #2c3e50; margin-bottom: 20px;">Détails du message</h2>
                        
                        <div style="margin-bottom: 15px;">
                            <strong>Nom:</strong> ${name}
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong>Email:</strong> ${email}
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong>Sujet:</strong> ${subject}
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong>Message:</strong><br>
                            <div style="background-color: white; padding: 15px; border-left: 4px solid #2c3e50; margin-top: 10px;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">
                                Ce message a été envoyé depuis le formulaire de contact du site Vagues de Riffs.<br>
                                Date: ${new Date().toLocaleString('fr-FR')}
                            </p>
                        </div>
                    </div>
                    
                    <div style="background-color: #2c3e50; color: white; padding: 15px; text-align: center;">
                        <p style="margin: 0; font-size: 12px;">
                            © 2024 Vagues de Riffs - Groupe de Rock
                        </p>
                    </div>
                </div>
            `
        };

        // Accusé de réception envoyé automatiquement au visiteur.
        const userMailOptions = {
            from: `"Vagues de Riffs" <noreply@vaguesderiffs.fr>`,
            to: email,
            subject: 'Confirmation de votre message - Vagues de Riffs',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Vagues de Riffs</h1>
                        <p style="margin: 5px 0;">Merci pour votre message!</p>
                    </div>
                    
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #2c3e50; margin-bottom: 20px;">Bonjour ${name},</h2>
                        
                        <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
                        
                        <div style="background-color: white; padding: 15px; border-left: 4px solid #2c3e50; margin: 20px 0;">
                            <strong>Sujet:</strong> ${subject}<br>
                            <strong>Votre message:</strong><br>
                            ${message.substring(0, 200)}${message.length > 200 ? '...' : ''}
                        </div>
                        
                        <p>Nous traiterons votre demande dans les plus brefs délais et vous répondrons dès que possible.</p>
                        
                        <div style="margin: 30px 0; padding: 20px; background-color: #e8f4f8; border-radius: 5px; text-align: center;">
                            <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Suivez-nous sur les réseaux sociaux!</h3>
                            <p style="margin: 0;">
                                <a href="#" style="margin: 0 10px; color: #2c3e50;">Facebook</a> |
                                <a href="#" style="margin: 0 10px; color: #2c3e50;">Twitter</a> |
                                <a href="#" style="margin: 0 10px; color: #2c3e50;">Instagram</a> |
                                <a href="#" style="margin: 0 10px; color: #2c3e50;">YouTube</a>
                            </p>
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 12px; color: #666;">
                            Si vous n'êtes pas à l'origine de ce message, veuillez nous contacter à contact@vaguesderiffs.fr
                        </p>
                    </div>
                    
                    <div style="background-color: #2c3e50; color: white; padding: 15px; text-align: center;">
                        <p style="margin: 0; font-size: 12px;">
                            © 2024 Vagues de Riffs - Groupe de Rock<br>
                            Le son du rock qui vous transporte
                        </p>
                    </div>
                </div>
            `
        };

        // Les deux envois sont parallélisés pour réduire l'attente côté client.
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        if (prefersHtml(req)) {
            // Redirection prévue pour une soumission classique sans JavaScript.
            return res.redirect('/contact?sent=1');
        }

        res.status(200).json({
            success: true,
            message: 'Message envoyé avec succès! Vous recevrez une confirmation par email.'
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message de contact:', error);

        if (prefersHtml(req)) {
            return res.status(500).send('Une erreur est survenue lors de l\'envoi du message.');
        }

        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.'
        });
    }
});

// Retourne l'historique des messages pour une future interface d'administration.
router.get('/messages', async (req, res) => {
    try {
        const sql = `
            SELECT id, name, email, subject, message, status, createdAt
            FROM contact_messages 
            ORDER BY createdAt DESC
        `;
        const messages = await db.query(sql);
        
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération des messages'
        });
    }
});

// Fait évoluer le statut métier d'un message : nouveau, lu, répondu.
router.patch('/messages/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }
        
        const sql = 'UPDATE contact_messages SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);
        
        res.json({
            success: true,
            message: 'Statut du message mis à jour'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la mise à jour du statut'
        });
    }
});

module.exports = router;
