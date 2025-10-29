const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class FavoriteRecipient {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS favorite_recipients (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                recipient_code TEXT NOT NULL,
                recipient_name TEXT NOT NULL,
                recipient_phone TEXT,
                saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                UNIQUE(customer_id, recipient_code)
            )
        `;
        return db.run(sql);
    }

    static async create(recipientData) {
        const sql = `
            INSERT INTO favorite_recipients (id, customer_id, recipient_code, recipient_name, recipient_phone)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                recipientData.id,
                recipientData.customer_id,
                recipientData.recipient_code,
                recipientData.recipient_name,
                recipientData.recipient_phone
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findByCustomerId(customerId) {
        const sql = `SELECT * FROM favorite_recipients WHERE customer_id = ? ORDER BY saved_at DESC`;
        return new Promise((resolve, reject) => {
            db.all(sql, [customerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async delete(recipientId) {
        const sql = `DELETE FROM favorite_recipients WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [recipientId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findByCustomerAndCode(customerId, recipientCode) {
        const sql = `SELECT * FROM favorite_recipients WHERE customer_id = ? AND recipient_code = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [customerId, recipientCode], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

module.exports = FavoriteRecipient;