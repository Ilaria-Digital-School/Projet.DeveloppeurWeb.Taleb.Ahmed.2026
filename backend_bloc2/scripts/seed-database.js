const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seedDatabase() {
    try {
        console.log('Debut du peuplement de la base de donnees...');

        await clearExistingData();

        const adminUserId = await createAdminUser();

        await createSampleConcerts(adminUserId);
        await createPortfolioItems(adminUserId);

        console.log('Base de donnees peuplee avec succes.');
    } catch (error) {
        console.error('Erreur lors du peuplement:', error);
        throw error;
    } finally {
        await db.close();
    }
}

async function clearExistingData() {
    console.log('Nettoyage des donnees existantes...');

    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('DELETE FROM contact_messages');
    await db.query('DELETE FROM newsletter_subscribers');
    await db.query('DELETE FROM portfolio');
    await db.query('DELETE FROM concerts');
    await db.query("DELETE FROM users WHERE role <> 'admin'");
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Donnees existantes nettoyees');
}

async function createAdminUser() {
    console.log("Creation ou mise a jour de l'administrateur...");

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

        console.log('Administrateur mis a jour');
        return existingAdmin.id;
    }

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

    console.log('Administrateur cree');
    return result.insertId;
}

async function createSampleConcerts(adminUserId) {
    console.log('Creation des concerts exemples...');

    const concerts = [
        {
            title: 'Vagues de Riffs - Lancement du Nouvel Album',
            venueName: 'Olympia',
            venueAddress: '28 Boulevard des Capucines',
            venueCity: 'Paris',
            venueCapacity: 2000,
            date: '2026-06-15',
            time: '20:00',
            priceMin: 35,
            priceMax: 75,
            priceCurrency: 'EUR',
            description: 'Soiree exceptionnelle pour le lancement du nouvel album.',
            status: 'upcoming',
            ticketUrl: 'https://billetterie.vaguesderiffs.fr/olympia',
            infoUrl: 'https://vaguesderiffs.fr/concert/olympia',
            image: 'https://picsum.photos/seed/concert-olympia/800/600.jpg',
            isFeatured: true,
            createdBy: adminUserId
        },
        {
            title: 'Festival Rock en Seine',
            venueName: 'Parc des Expositions',
            venueAddress: 'Place de la Concorde',
            venueCity: 'Paris',
            venueCapacity: 5000,
            date: '2026-07-20',
            time: '18:00',
            priceMin: 45,
            priceMax: 89,
            priceCurrency: 'EUR',
            description: "Vagues de Riffs en tete d'affiche du festival de l'ete.",
            status: 'upcoming',
            ticketUrl: 'https://billetterie.vaguesderiffs.fr/festival-seine',
            infoUrl: 'https://vaguesderiffs.fr/festival-seine',
            image: 'https://picsum.photos/seed/festival-seine/800/600.jpg',
            isFeatured: true,
            createdBy: adminUserId
        },
        {
            title: 'Session Acoustique Intime',
            venueName: 'Le Petit Journal',
            venueAddress: '12 Rue de la Ferronnerie',
            venueCity: 'Lyon',
            venueCapacity: 150,
            date: '2026-05-10',
            time: '19:30',
            priceMin: 20,
            priceMax: null,
            priceCurrency: 'EUR',
            description: 'Une soiree acoustique unique dans un cadre intimiste.',
            status: 'sold_out',
            ticketUrl: '',
            infoUrl: 'https://vaguesderiffs.fr/lyon-acoustic',
            image: 'https://picsum.photos/seed/lyon-acoustic/800/600.jpg',
            isFeatured: false,
            createdBy: adminUserId
        },
        {
            title: 'Soiree Metal au Transbordeur',
            venueName: 'Le Transbordeur',
            venueAddress: '1 Quai Gillet',
            venueCity: 'Lyon',
            venueCapacity: 1200,
            date: '2026-08-25',
            time: '20:00',
            priceMin: 28,
            priceMax: 55,
            priceCurrency: 'EUR',
            description: 'Une soiree explosive avec plusieurs groupes rock.',
            status: 'upcoming',
            ticketUrl: 'https://billetterie.vaguesderiffs.fr/transbordeur-metal',
            infoUrl: 'https://vaguesderiffs.fr/transbordeur-metal',
            image: 'https://picsum.photos/seed/transbordeur-metal/800/600.jpg',
            isFeatured: false,
            createdBy: adminUserId
        },
        {
            title: 'Concert Anniversaire - 5 Ans',
            venueName: "L'Aeronef",
            venueAddress: '20 Quai Palmer',
            venueCity: 'Cenon',
            venueCapacity: 3000,
            date: '2026-09-15',
            time: '19:00',
            priceMin: 25,
            priceMax: 65,
            priceCurrency: 'EUR',
            description: 'Celebration des 5 ans de carriere du groupe.',
            status: 'upcoming',
            ticketUrl: 'https://billetterie.vaguesderiffs.fr/5-ans',
            infoUrl: 'https://vaguesderiffs.fr/5-ans',
            image: 'https://picsum.photos/seed/concert-5ans/800/600.jpg',
            isFeatured: true,
            createdBy: adminUserId
        }
    ];

    for (const concert of concerts) {
        await db.insert('concerts', concert);
    }

    console.log(`${concerts.length} concerts crees`);
}

async function createPortfolioItems(adminUserId) {
    console.log('Creation des elements du portfolio...');

    const portfolioItems = [
        {
            title: 'Premier Album - Premiere Vague',
            description: 'Premier EP du groupe.',
            image: 'https://picsum.photos/seed/album-premiere-vague/800/600.jpg',
            category: 'album',
            isFeatured: true,
            createdBy: adminUserId
        },
        {
            title: 'Clip Video - Echo Urbain',
            description: 'Premier clip tourne dans les rues de Paris.',
            image: 'https://picsum.photos/seed/clip-echo-urbain/800/600.jpg',
            category: 'video',
            isFeatured: true,
            createdBy: adminUserId
        },
        {
            title: 'Session Studio - Resonances',
            description: "Enregistrement de l'album Resonances.",
            image: 'https://picsum.photos/seed/studio-resonances/800/600.jpg',
            category: 'studio',
            isFeatured: false,
            createdBy: adminUserId
        },
        {
            title: 'Tournee 2023 - Vagues Francaises',
            description: 'Premiere tournee nationale du groupe.',
            image: 'https://picsum.photos/seed/tournee-2023/800/600.jpg',
            category: 'concert',
            isFeatured: true,
            createdBy: adminUserId
        },
        {
            title: 'Festival Les Vieilles Charrues',
            description: 'Performance memorables sur une grande scene festival.',
            image: 'https://picsum.photos/seed/festival-vieilles-charrues/800/600.jpg',
            category: 'festival',
            isFeatured: false,
            createdBy: adminUserId
        },
        {
            title: 'Session Acoustique - Radio France',
            description: 'Session live acoustique pour la radio.',
            image: 'https://picsum.photos/seed/acoustic-radio-france/800/600.jpg',
            category: 'acoustic',
            isFeatured: false,
            createdBy: adminUserId
        }
    ];

    for (const item of portfolioItems) {
        await db.insert('portfolio', item);
    }

    console.log(`${portfolioItems.length} elements du portfolio crees`);
}

if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Peuplement termine');
            console.log('Email: admin@vaguesderiffs.fr');
            console.log('Username: admin');
            console.log('Password: admin123');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Echec du peuplement:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };
