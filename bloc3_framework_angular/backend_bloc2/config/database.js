const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vagues_de_riffs_portfolio',
    charset: 'utf8mb4',
    timezone: '+00:00',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Connecté à la base de données MySQL');
        connection.release();
    })
    .catch(error => {
        console.error('❌ Erreur de connexion à MySQL:', error);
    });

// Helper function to execute queries
const query = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Erreur de requête SQL:', error);
        throw error;
    }
};

// Helper function to execute transactions
const transaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Helper functions for common operations
const db = {
    // Find one record
    findOne: async (table, where, select = '*') => {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `SELECT ${select} FROM ${table} WHERE ${whereClause} LIMIT 1`;
        const results = await query(sql, values);
        return results[0] || null;
    },

    // Find multiple records
    find: async (table, where = {}, select = '*', orderBy = '', limit = '', offset = '') => {
        let sql = `SELECT ${select} FROM ${table}`;
        const values = [];
        
        if (Object.keys(where).length > 0) {
            const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            values.push(...Object.values(where));
        }
        
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }
        
        if (limit) {
            sql += ` LIMIT ${limit}`;
        }
        
        if (offset) {
            sql += ` OFFSET ${offset}`;
        }
        
        return await query(sql, values);
    },

    // Insert record
    insert: async (table, data) => {
        const fields = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;
        const result = await query(sql, values);
        return { insertId: result.insertId, affectedRows: result.affectedRows };
    },

    // Update record
    update: async (table, data, where) => {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = [...Object.values(data), ...Object.values(where)];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const result = await query(sql, values);
        return { affectedRows: result.affectedRows };
    },

    // Delete record
    delete: async (table, where) => {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await query(sql, values);
        return { affectedRows: result.affectedRows };
    },

    // Count records
    count: async (table, where = {}) => {
        let sql = `SELECT COUNT(*) as count FROM ${table}`;
        const values = [];
        
        if (Object.keys(where).length > 0) {
            const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            values.push(...Object.values(where));
        }
        
        const result = await query(sql, values);
        return result[0].count;
    },

    // Custom query
    query: query,
    transaction: transaction,

    // Close connection pool
    close: async () => {
        await pool.end();
    }
};

module.exports = db;
