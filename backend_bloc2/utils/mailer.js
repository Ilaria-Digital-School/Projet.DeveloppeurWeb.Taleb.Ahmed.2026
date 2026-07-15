const nodemailer = require('nodemailer');

const mailPort = Number(process.env.MAIL_PORT || 1025);

// Configuration du transporteur pointant vers MailHog
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'localhost',
    port: mailPort,
    secure: false, // MailHog n'utilise pas de SSL
    ignoreTLS: true
});

module.exports = transporter;
