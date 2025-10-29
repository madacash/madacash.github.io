const RechargeCard = require('../models/RechargeCard');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { generateId } = require('../utils/helpers');

class RechargeController {
    // شحن الرصيد
    static async rechargeBalance(req, res) {
        try {
            const { customerId, cardNumber } = req.body;

            // التحقق من وجود العميل
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            // البحث عن بطاقة الشحن
            const rechargeCard = await RechargeCard.findAvailableByNumber(cardNumber);
            if (!rechargeCard) {
                return res.json({
                    success: false,
                    message: 'رقم البطاقة غير صحيح أو مستخدم مسبقاً'
                });
            }

            // تحديث رصيد العميل
            const newBalance = customer.balance + rechargeCard.amount;
            await Customer.updateBalance(customerId, newBalance);

            // تحديث بطاقة الشحن كمستخدمة
            await RechargeCard.markAsUsed(rechargeCard.id, customerId);

            // إضافة عملية الشحن
            await Transaction.create({
                id: generateId(),
                customer_id: customerId,
                type: 'شحن',
                description: `شحن رصيد ببطاقة ${rechargeCard.amount} ريال`,
                amount: rechargeCard.amount,
                balance_before: customer.balance,
                balance_after: newBalance,
                card_number: cardNumber,
                points: 0
            });

            // إضافة تنبيه
            await Notification.create({
                id: generateId(),
                customer_id: customerId,
                type: 'recharge',
                title: 'تم شحن الرصيد بنجاح',
                message: `تمت إضافة ${rechargeCard.amount} ريال إلى رصيدك. رصيدك الحالي: ${newBalance} ريال`
            });

            res.json({
                success: true,
                message: 'تم شحن الرصيد بنجاح',
                amount: rechargeCard.amount,
                new_balance: newBalance
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء شحن الرصيد: ' + error.message
            });
        }
    }

    // جلب بطاقات الشحن المتاحة
    static async getAvailableRechargeCards(req, res) {
        try {
            const counts = await RechargeCard.getAvailableCounts();
            
            res.json({
                success: true,
                available_cards: counts
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب بطاقات الشحن: ' + error.message
            });
        }
    }
}

module.exports = RechargeController;