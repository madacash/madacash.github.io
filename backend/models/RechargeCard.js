const db = require('../config/database');

class RechargeCard {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS recharge_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                card_number TEXT UNIQUE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                used BOOLEAN DEFAULT 0,
                customer_id TEXT,
                used_at DATETIME,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `;
        return db.run(sql);
    }

    static async create(cardData) {
        const sql = `
            INSERT INTO recharge_cards (card_number, amount, used, customer_id, used_at)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                cardData.card_number,
                cardData.amount,
                cardData.used,
                cardData.customer_id,
                cardData.used_at
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findAvailableByNumber(cardNumber) {
        const sql = `SELECT * FROM recharge_cards WHERE card_number = ? AND used = 0`;
        return new Promise((resolve, reject) => {
            db.get(sql, [cardNumber], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async markAsUsed(cardId, customerId) {
        const sql = `UPDATE recharge_cards SET used = 1, customer_id = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [customerId, cardId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async getAvailableCounts() {
        const sql = `SELECT amount, COUNT(*) as count FROM recharge_cards WHERE used = 0 GROUP BY amount`;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = RechargeCard;