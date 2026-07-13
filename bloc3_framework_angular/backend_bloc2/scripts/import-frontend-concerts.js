require('dotenv').config();

const db = require('../config/database');

const concerts = [
    {
        title: 'Olympia - Paris',
        venueName: 'Olympia',
        venueAddress: '28 Boulevard des Capucines, 75009 Paris',
        venueCity: 'Paris',
        concertDate: '2024-03-15',
        concertTime: '20:00'
    },
    {
        title: 'Le Transbordeur - Lyon',
        venueName: 'Le Transbordeur',
        venueAddress: '1 Quai Gillet, 69001 Lyon',
        venueCity: 'Lyon',
        concertDate: '2024-03-22',
        concertTime: '19:30'
    },
    {
        title: 'Le Bikini - Toulouse',
        venueName: 'Le Bikini',
        venueAddress: '20 Rue de la Poudriere, 31100 Toulouse',
        venueCity: 'Toulouse',
        concertDate: '2024-04-05',
        concertTime: '20:30'
    },
    {
        title: "L'Aeronef - Lille",
        venueName: "L'Aeronef",
        venueAddress: 'Boulevard de la Liberte, 59800 Lille',
        venueCity: 'Lille',
        concertDate: '2024-04-12',
        concertTime: '19:00'
    },
    {
        title: 'Le Rocher de Palmer - Bordeaux',
        venueName: 'Le Rocher de Palmer',
        venueAddress: 'Quai Palmer, 33100 Cenon',
        venueCity: 'Bordeaux',
        concertDate: '2024-04-20',
        concertTime: '20:00'
    },
    {
        title: 'Le Cargo - Nantes',
        venueName: 'Le Cargo',
        venueAddress: '19 Quai de la Motte Rouge, 44000 Nantes',
        venueCity: 'Nantes',
        concertDate: '2024-05-03',
        concertTime: '19:30'
    }
];

async function importConcerts() {
    const createdBy = 1;

    for (const concert of concerts) {
        const existing = await db.query(
            'SELECT id FROM concerts WHERE title = ? AND concert_date = ? LIMIT 1',
            [concert.title, concert.concertDate]
        );

        const values = [
            concert.title,
            concert.venueName,
            concert.venueAddress,
            concert.venueCity,
            null,
            concert.concertDate,
            concert.concertTime,
            0,
            null,
            'EUR',
            `Concert de Vagues de Riffs a ${concert.venueName}, ${concert.venueCity}.`,
            'completed',
            null,
            null,
            null,
            false
        ];

        if (existing.length > 0) {
            await db.query(
                `UPDATE concerts
                 SET title = ?, venue_name = ?, venue_address = ?, venue_city = ?,
                     venue_capacity = ?, concert_date = ?, concert_time = ?,
                     price_min = ?, price_max = ?, price_currency = ?,
                     description = ?, status = ?, ticket_url = ?, info_url = ?,
                     image = ?, is_featured = ?
                 WHERE id = ?`,
                [...values, existing[0].id]
            );

            console.log(`Updated: ${concert.title}`);
            continue;
        }

        await db.query(
            `INSERT INTO concerts (
                title, venue_name, venue_address, venue_city, venue_capacity,
                concert_date, concert_time, price_min, price_max, price_currency,
                description, status, ticket_url, info_url, image, is_featured,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [...values, createdBy]
        );

        console.log(`Inserted: ${concert.title}`);
    }
}

importConcerts()
    .then(async () => {
        console.log('Concert import complete.');
        await db.close();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error('Concert import failed:', error);
        await db.close();
        process.exit(1);
    });
