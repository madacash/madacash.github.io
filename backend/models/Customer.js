const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Customer {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                area TEXT,
                phone TEXT UNIQUE NOT NULL,
                unique_code TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                balance DECIMAL(10,2) DEFAULT 0,
                gift_points INTEGER DEFAULT 0,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                bank_account_number TEXT,
                bank_type TEXT
            )
        `;
        return db.run(sql);
    }

    static async create(customerData) {
        const sql = `
            INSERT INTO customers (id, name, area, phone, unique_code, password, balance, gift_points, bank_account_number, bank_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [
                customerData.id,
                customerData.name,
                customerData.area,
                customerData.phone,
                customerData.unique_code,
                customerData.password,
                customerData.balance,
                customerData.gift_points,
                customerData.bank_account_number,
                customerData.bank_type
            ], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async findByPhone(phone) {
        const sql = `SELECT * FROM customers WHERE phone = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [phone], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async findById(id) {
        const sql = `SELECT * FROM customers WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async findByCode(uniqueCode) {
        const sql = `SELECT * FROM customers WHERE unique_code = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [uniqueCode], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async updateBalance(customerId, newBalance) {
        const sql = `UPDATE customers SET balance = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [newBalance, customerId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async updatePoints(customerId, newPoints) {
        const sql = `UPDATE customers SET gift_points = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [newPoints, customerId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async updateLastLogin(customerId) {
        const sql = `UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [customerId], function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static async updateProfile(customerId, updates) {
        const fields = [];
        const values = [];
        
        if (updates.name) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.area) {
            fields.push('area = ?');
            values.push(updates.area);
        }
        if (updates.phone) {
            fields.push('phone = ?');
            values.push(updates.phone);
        }
        if (updates.password) {
            fields.push('password = ?');
            values.push(updates.password);
        }
        if (updates.bank_account_number !== undefined) {
            fields.push('bank_account_number = ?');
            values.push(updates.bank_account_number);
        }
        if (updates.bank_type !== undefined) {
            fields.push('bank_type = ?');
            values.push(updates.bank_type);
        }
        
        if (fields.length === 0) {
            return Promise.resolve();
        }
        
        values.push(customerId);
        const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
        
        return new Promise((resolve, reject) => {
            db.run(sql, values, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }
}

module.exports = Customer;