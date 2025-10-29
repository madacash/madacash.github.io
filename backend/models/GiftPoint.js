const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class GiftPoint {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS gift_points (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                type TEXT NOT NULL,
                points INTEGER NOT NULL,
                balance_before INTEGER,
                balance_after INTEGER,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `;
        return db.run(sql);
    }

    static async create(pointData) {
        const sql = `
            INSERT INTO gift_points (id, customer_id, type, points, balance_before, balance_after, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                pointData.id,
                pointData.customer_id,
                pointData.type,
                pointData.points,
                pointData.balance_before,
                pointData.balance_after,
                pointData.description
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findByCustomerId(customerId) {
        const sql = `SELECT * FROM gift_points WHERE customer_id = ? ORDER BY created_at DESC`;
        return new Promise((resolve, reject) => {
            db.all(sql, [customerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getCustomerPointsSummary(customerId) {
        const sql = `
            SELECT 
                SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as earned_points,
                SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) as redeemed_points
            FROM gift_points 
            WHERE customer_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.get(sql, [customerId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

module.exports = GiftPoint;