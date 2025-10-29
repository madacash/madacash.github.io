const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Transaction {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                amount DECIMAL(10,2),
                balance_before DECIMAL(10,2),
                balance_after DECIMAL(10,2),
                card_number TEXT,
                points INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `;
        return db.run(sql);
    }

    static async create(transactionData) {
        const sql = `
            INSERT INTO transactions (id, customer_id, type, description, amount, balance_before, balance_after, card_number, points)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                transactionData.id,
                transactionData.customer_id,
                transactionData.type,
                transactionData.description,
                transactionData.amount,
                transactionData.balance_before,
                transactionData.balance_after,
                transactionData.card_number,
                transactionData.points
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findByCustomerId(customerId, filterType = 'all') {
        let sql = `SELECT * FROM transactions WHERE customer_id = ?`;
        const params = [customerId];
        
        if (filterType !== 'all') {
            sql += ` AND type = ?`;
            params.push(filterType);
        }
        
        sql += ` ORDER BY created_at DESC`;
        
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getCustomerStats(customerId) {
        const sql = `
            SELECT 
                type,
                SUM(amount) as total_amount,
                COUNT(*) as count
            FROM transactions 
            WHERE customer_id = ? 
            GROUP BY type
        `;
        
        return new Promise((resolve, reject) => {
            db.all(sql, [customerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = Transaction;