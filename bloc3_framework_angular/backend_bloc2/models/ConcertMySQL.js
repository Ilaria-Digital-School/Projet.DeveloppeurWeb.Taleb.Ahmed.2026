const db = require('../config/database');

class Concert {
    constructor(concertData = {}) {
        this.id = concertData.id || null;
        this.title = concertData.title || '';
        this.venueName = concertData.venue_name || concertData.venueName || concertData.venue?.name || '';
        this.venueAddress = concertData.venue_address || concertData.venueAddress || concertData.venue?.address || '';
        this.venueCity = concertData.venue_city || concertData.venueCity || concertData.venue?.city || '';
        this.venueCapacity = concertData.venue_capacity ?? concertData.venueCapacity ?? concertData.venue?.capacity ?? null;
        this.date = concertData.concert_date || concertData.date || null;
        this.time = concertData.concert_time || concertData.time || '';
        this.priceMin = concertData.price_min ?? concertData.priceMin ?? concertData.price?.min ?? 0;
        this.priceMax = concertData.price_max ?? concertData.priceMax ?? concertData.price?.max ?? null;
        this.priceCurrency = concertData.price_currency || concertData.priceCurrency || concertData.price?.currency || 'EUR';
        this.description = concertData.description || '';
        this.status = concertData.status || 'upcoming';
        this.ticketUrl = concertData.ticket_url || concertData.ticketUrl || null;
        this.infoUrl = concertData.info_url || concertData.infoUrl || null;
        this.image = concertData.image || null;
        this.isFeatured = Boolean(concertData.is_featured ?? concertData.isFeatured ?? false);
        this.createdBy = concertData.created_by || concertData.createdBy || null;
        this.createdByUsername = concertData.created_by_username || concertData.createdByUsername || null;
        this.createdAt = concertData.createdAt || null;
        this.updatedAt = concertData.updatedAt || null;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            venue: {
                name: this.venueName,
                address: this.venueAddress,
                city: this.venueCity,
                capacity: this.venueCapacity
            },
            date: this.date,
            time: this.time,
            price: {
                min: this.priceMin,
                max: this.priceMax,
                currency: this.priceCurrency
            },
            description: this.description,
            status: this.status,
            ticketUrl: this.ticketUrl,
            infoUrl: this.infoUrl,
            image: this.image,
            isFeatured: this.isFeatured,
            createdBy: this.createdBy,
            createdByUsername: this.createdByUsername,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    async save() {
        if (this.id) {
            await db.query(
                `UPDATE concerts
                 SET title = ?, venue_name = ?, venue_address = ?, venue_city = ?,
                     venue_capacity = ?, concert_date = ?, concert_time = ?,
                     price_min = ?, price_max = ?, price_currency = ?,
                     description = ?, status = ?, ticket_url = ?, info_url = ?,
                     image = ?, is_featured = ?, updatedAt = ?
                 WHERE id = ?`,
                [
                    this.title,
                    this.venueName,
                    this.venueAddress,
                    this.venueCity,
                    this.venueCapacity,
                    this.date,
                    this.time,
                    this.priceMin,
                    this.priceMax,
                    this.priceCurrency,
                    this.description,
                    this.status,
                    this.ticketUrl,
                    this.infoUrl,
                    this.image,
                    this.isFeatured ? 1 : 0,
                    new Date(),
                    this.id
                ]
            );

            return this;
        }

        const result = await db.query(
            `INSERT INTO concerts (
                title, venue_name, venue_address, venue_city, venue_capacity,
                concert_date, concert_time, price_min, price_max, price_currency,
                description, status, ticket_url, info_url, image, is_featured,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                this.title,
                this.venueName,
                this.venueAddress,
                this.venueCity,
                this.venueCapacity,
                this.date,
                this.time,
                this.priceMin,
                this.priceMax,
                this.priceCurrency,
                this.description,
                this.status,
                this.ticketUrl,
                this.infoUrl,
                this.image,
                this.isFeatured ? 1 : 0,
                this.createdBy
            ]
        );

        this.id = result.insertId;
        return this;
    }

    static async findById(id) {
        const rows = await db.query(
            `SELECT c.*, u.username AS created_by_username
             FROM concerts c
             LEFT JOIN users u ON u.id = c.created_by
             WHERE c.id = ?
             LIMIT 1`,
            [id]
        );

        return rows[0] ? new Concert(rows[0]) : null;
    }

    static async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            city,
            upcoming,
            featured = false,
            orderBy = 'c.concert_date ASC, c.concert_time ASC'
        } = options;

        const where = [];
        const values = [];

        if (status) {
            where.push('c.status = ?');
            values.push(status);
        }

        if (city) {
            where.push('c.venue_city LIKE ?');
            values.push(`%${city}%`);
        }

        if (upcoming === true || upcoming === 'true') {
            where.push('c.concert_date >= CURDATE()');
            where.push("c.status IN ('upcoming', 'sold_out')");
        }

        if (featured) {
            where.push('c.is_featured = 1');
        }

        const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const offset = (parsedPage - 1) * parsedLimit;

        const rows = await db.query(
            `SELECT c.*, u.username AS created_by_username
             FROM concerts c
             LEFT JOIN users u ON u.id = c.created_by
             ${whereSql}
             ORDER BY ${orderBy}
             LIMIT ? OFFSET ?`,
            [...values, parsedLimit, offset]
        );

        const countRows = await db.query(
            `SELECT COUNT(*) AS total
             FROM concerts c
             ${whereSql}`,
            values
        );

        const total = countRows[0]?.total || 0;

        return {
            concerts: rows.map((row) => new Concert(row)),
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total,
                pages: Math.ceil(total / parsedLimit)
            }
        };
    }

    static async findFeatured(limit = 5) {
        const { concerts } = await Concert.findAll({
            page: 1,
            limit,
            featured: true,
            upcoming: true
        });

        return concerts;
    }

    static async findCities() {
        const rows = await db.query(
            `SELECT DISTINCT venue_city
             FROM concerts
             WHERE concert_date >= CURDATE()
               AND status IN ('upcoming', 'sold_out')
             ORDER BY venue_city ASC`
        );

        return rows.map((row) => row.venue_city);
    }

    static async delete(id) {
        const result = await db.query('DELETE FROM concerts WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Concert;
