const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { generateId } = require('../utils/helpers');

class TransactionController {
    // جلب عمليات العميل
    static async getTransactions(req, res) {
        try {
            const { customerId } = req.params;
            const { filterType = 'all' } = req.query;

            const transactions = await Transaction.findByCustomerId(customerId, filterType);

            res.json({
                success: true,
                transactions: transactions
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب العمليات: ' + error.message
            });
        }
    }

    // جلب إحصائيات العميل
    static async getCustomerStats(req, res) {
        try {
            const { customerId } = req.params;

            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            // جلب جميع العمليات
            const transactions = await Transaction.findByCustomerId(customerId);
            
            // حساب الإحصائيات
            let totalRecharged = 0;
            let totalReceived = 0;
            let totalSent = 0;

            transactions.forEach(transaction => {
                switch(transaction.type) {
                    case 'شحن':
                        totalRecharged += Math.abs(transaction.amount);
                        break;
                    case 'حوالة واردة':
                        totalReceived += Math.abs(transaction.amount);
                        break;
                    case 'حوالة صادرة':
                        totalSent += Math.abs(transaction.amount);
                        break;
                }
            });

            const stats = {
                currentBalance: customer.balance,
                totalRecharged: totalRecharged,
                totalReceived: totalReceived,
                totalSent: totalSent,
                totalTransactions: transactions.length,
                netMovement: totalRecharged + totalReceived - totalSent,
                currentPoints: customer.gift_points,
                lastUpdate: new Date().toISOString()
            };

            res.json({
                success: true,
                stats: stats
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب الإحصائيات: ' + error.message
            });
        }
    }
}

module.exports = TransactionController;