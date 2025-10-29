const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Notification {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                customer_id TEXT NOT NULL,
                type TEXT NOT NULL,
                title TEXT,
                message TEXT,
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `;
        return db.run(sql);
    }

    static async create(notificationData) {
        const sql = `
            INSERT INTO notifications (id, customer_id, type, title, message, is_read)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                notificationData.id,
                notificationData.customer_id,
                notificationData.type,
                notificationData.title,
                notificationData.message,
                notificationData.is_read
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findByCustomerId(customerId) {
        const sql = `SELECT * FROM notifications WHERE customer_id = ? ORDER BY created_at DESC`;
        return new Promise((resolve, reject) => {
            db.all(sql, [customerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async markAsRead(notificationId) {
        const sql = `UPDATE notifications SET is_read = 1 WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [notificationId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async delete(notificationId) {
        const sql = `DELETE FROM notifications WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [notificationId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async deleteAllByCustomer(customerId) {
        const sql = `DELETE FROM notifications WHERE customer_id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [customerId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async getUnreadCount(customerId) {
        const sql = `SELECT COUNT(*) as count FROM notifications WHERE customer_id = ? AND is_read = 0`;
        return new Promise((resolve, reject) => {
            db.get(sql, [customerId], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
    }
}

module.exports = Notification;