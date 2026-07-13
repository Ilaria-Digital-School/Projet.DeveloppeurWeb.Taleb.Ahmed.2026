const bcrypt = require('bcryptjs');
const db = require('../config/database');

class User {
    constructor(userData = {}) {
        this.id = userData.id || null;
        this.firstName = userData.firstName || '';
        this.lastName = userData.lastName || '';
        this.email = userData.email || '';
        this.username = userData.username || '';
        this.password = userData.password || '';
        this.birthDate = userData.birthDate || null;
        this.newsletter = userData.newsletter || false;
        this.role = userData.role || 'user';
        this.isActive = userData.isActive !== undefined ? userData.isActive : true;
        this.lastLogin = userData.lastLogin || null;
        this.createdAt = userData.createdAt || new Date();
        this.updatedAt = userData.updatedAt || new Date();
    }

    // Hash password before saving
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2')) {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    // Verify password
    async comparePassword(candidatePassword) {
        if (!this.password) return false;
        return await bcrypt.compare(candidatePassword, this.password);
    }

    // Get user profile without sensitive data
    toProfileJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            username: this.username,
            birthDate: this.birthDate,
            newsletter: this.newsletter,
            role: this.role,
            isActive: this.isActive,
            lastLogin: this.lastLogin,
            createdAt: this.createdAt
        };
    }

    // Save user to database
    async save() {
        await this.hashPassword();
        
        if (this.id) {
            // Update existing user
            const sql = `
                UPDATE users SET 
                    firstName = ?, lastName = ?, email = ?, username = ?, 
                    password = ?, birthDate = ?, newsletter = ?, 
                    role = ?, isActive = ?, lastLogin = ?, updatedAt = ?
                WHERE id = ?
            `;
            const values = [
                this.firstName, this.lastName, this.email, this.username,
                this.password, this.birthDate, this.newsletter,
                this.role, this.isActive, this.lastLogin, new Date(),
                this.id
            ];
            await db.query(sql, values);
        } else {
            // Insert new user
            const sql = `
                INSERT INTO users (
                    firstName, lastName, email, username, password, 
                    birthDate, newsletter, role, isActive, 
                    lastLogin, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                this.firstName, this.lastName, this.email, this.username,
                this.password, this.birthDate, this.newsletter,
                this.role, this.isActive, this.lastLogin,
                this.createdAt, this.updatedAt
            ];
            const result = await db.query(sql, values);
            this.id = result.insertId;
        }
        
        return this;
    }

    // Static methods
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ? AND isActive = 1';
        const users = await db.query(sql, [id]);
        return users[0] ? new User(users[0]) : null;
    }

    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const users = await db.query(sql, [email]);
        return users[0] ? new User(users[0]) : null;
    }

    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const users = await db.query(sql, [username]);
        return users[0] ? new User(users[0]) : null;
    }

    static async findByEmailOrUsername(emailOrUsername) {
        const sql = 'SELECT * FROM users WHERE email = ? OR username = ?';
        const users = await db.query(sql, [emailOrUsername, emailOrUsername]);
        return users[0] ? new User(users[0]) : null;
    }

    static async existsByEmailOrUsername(email, username) {
        const sql = 'SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1';
        const users = await db.query(sql, [email, username]);
        return users[0] || null;
    }

    static async findAll(options = {}) {
        let sql = 'SELECT id, firstName, lastName, email, username, role, isActive, lastLogin, createdAt FROM users';
        const values = [];
        const { page = 1, limit = 10, search, role } = options;

        // Add WHERE conditions
        const whereConditions = [];
        if (search) {
            whereConditions.push('(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR username LIKE ?)');
            values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (role) {
            whereConditions.push('role = ?');
            values.push(role);
        }

        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        sql += ' ORDER BY createdAt DESC';

        // Add pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        sql += ' LIMIT ? OFFSET ?';
        values.push(parseInt(limit), offset);

        const users = await db.query(sql, values);
        
        // Get total count
        const countSql = 'SELECT COUNT(*) as total FROM users' + 
            (whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '');
        const countValues = whereConditions.length > 0 ? values.slice(0, -2) : [];
        const countResult = await db.query(countSql, countValues);
        const total = countResult[0].total;

        return {
            users: users.map(user => new User(user)),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    static async updateLastLogin(userId) {
        const sql = 'UPDATE users SET lastLogin = ? WHERE id = ?';
        await db.query(sql, [new Date(), userId]);
    }

    static async toggleActive(userId, isActive) {
        const sql = 'UPDATE users SET isActive = ?, updatedAt = ? WHERE id = ?';
        await db.query(sql, [isActive, new Date(), userId]);
    }

    static async delete(userId) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await db.query(sql, [userId]);
        return result.affectedRows > 0;
    }
}

module.exports = User;
