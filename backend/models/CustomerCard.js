const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CustomerCard {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS customer_cards (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                package_name TEXT NOT NULL,
                duration TEXT,
                price DECIMAL(10,2),
                data_amount TEXT,
                card_number TEXT NOT NULL,
                acquisition_type TEXT NOT NULL,
                acquisition_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'نشط',
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `;
        return db.run(sql);
    }

    static async create(cardData) {
        const sql = `
            INSERT INTO customer_cards (id, customer_id, package_name, duration, price, data_amount, card_number, acquisition_type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                cardData.id,
                cardData.customer_id,
                cardData.package_name,
                cardData.duration,
                cardData.price,
                cardData.data_amount,
                cardData.card_number,
                cardData.acquisition_type,
                cardData.status
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findByCustomerId(customerId) {
        const sql = `SELECT * FROM customer_cards WHERE customer_id = ? ORDER BY acquisition_date DESC`;
        return new Promise((resolve, reject) => {
            db.all(sql, [customerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getCustomerStats(customerId) {
        const sql = `
            SELECT 
                acquisition_type,
                COUNT(*) as count
            FROM customer_cards 
            WHERE customer_id = ? 
            GROUP BY acquisition_type
        `;
        
        return new Promise((resolve, reject) => {
            db.all(sql, [customerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = CustomerCard;