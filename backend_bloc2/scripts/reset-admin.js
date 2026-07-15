const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function resetAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const existingAdmin =
            await db.findOne('users', { email: 'admin@vaguesderiffs.fr' }) ||
            await db.findOne('users', { username: 'admin' });

        if (existingAdmin) {
            await db.update('users', {
                firstName: 'Admin',
                lastName: 'Vagues de Riffs',
                email: 'admin@vaguesderiffs.fr',
                username: 'admin',
                password: hashedPassword,
                birthDate: '1990-01-01',
                role: 'admin',
                newsletter: true,
                isActive: true,
                updatedAt: new Date()
            }, { id: existingAdmin.id });

            console.log('Compte admin mis a jour avec succes.');
        } else {
            const result = await db.insert('users', {
                firstName: 'Admin',
                lastName: 'Vagues de Riffs',
                email: 'admin@vaguesderiffs.fr',
                username: 'admin',
                password: hashedPassword,
                birthDate: '1990-01-01',
                role: 'admin',
                newsletter: true,
                isActive: true
            });

            console.log(`Compte admin cree avec succes. ID: ${result.insertId}`);
        }

        console.log('Email: admin@vaguesderiffs.fr');
        console.log('Mot de passe: admin123');
    } catch (error) {
        console.error('Erreur lors de la reinitialisation du compte admin:', error);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
}

if (require.main === module) {
    resetAdmin();
}

module.exports = { resetAdmin };
