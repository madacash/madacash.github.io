const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Package {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS packages (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                duration TEXT,
                price DECIMAL(10,2),
                data_amount TEXT,
                card_number TEXT,
                used BOOLEAN DEFAULT 0,
                customer_id TEXT,
                used_at DATETIME,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `;
        return db.run(sql);
    }

    static async create(packageData) {
        const sql = `
            INSERT INTO packages (id, name, duration, price, data_amount, card_number, used, customer_id, used_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                packageData.id,
                packageData.name,
                packageData.duration,
                packageData.price,
                packageData.data_amount,
                packageData.card_number,
                packageData.used,
                packageData.customer_id,
                packageData.used_at
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findAvailableByName(packageName) {
        const sql = `SELECT * FROM packages WHERE name = ? AND used = 0 LIMIT 1`;
        return new Promise((resolve, reject) => {
            db.get(sql, [packageName], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async markAsUsed(packageId, customerId) {
        const sql = `UPDATE packages SET used = 1, customer_id = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [customerId, packageId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async getAvailableCounts() {
        const sql = `SELECT name, COUNT(*) as count FROM packages WHERE used = 0 GROUP BY name`;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getAllPackages() {
        const sql = `SELECT DISTINCT name, duration, price, data_amount FROM packages`;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = Package;