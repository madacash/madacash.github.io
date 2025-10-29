const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const FavoriteRecipient = require('../models/FavoriteRecipient');
const { generateId } = require('../utils/helpers');

class TransferController {
    // تحويل الرصيد
    static async transferBalance(req, res) {
        try {
            const { fromCustomerId, toUniqueCode, amount, password, saveToFavorites, recipientName, recipientPhone } = req.body;

            // التحقق من المبلغ
            if (amount <= 0) {
                return res.json({
                    success: false,
                    message: 'المبلغ يجب أن يكون أكبر من صفر'
                });
            }

            // الحصول على بيانات المرسل والتحقق من كلمة المرور
            const fromCustomer = await Customer.findById(fromCustomerId);
            if (!fromCustomer) {
                return res.json({
                    success: false,
                    message: 'حسابك غير موجود'
                });
            }

            if (fromCustomer.password !== password) {
                return res.json({
                    success: false,
                    message: 'كلمة المرور غير صحيحة'
                });
            }

            // التحقق من عدم التحويل لنفس الكود
            if (fromCustomer.unique_code === toUniqueCode) {
                return res.json({
                    success: false,
                    message: 'لا يمكنك التحويل لنفسك'
                });
            }

            // التحقق من الرصيد
            if (fromCustomer.balance < amount) {
                return res.json({
                    success: false,
                    message: 'رصيدك غير كافٍ للتحويل'
                });
            }

            // الحصول على بيانات المستقبل
            const toCustomer = await Customer.findByCode(toUniqueCode);
            if (!toCustomer) {
                return res.json({
                    success: false,
                    message: 'الكود المميز للمستلم غير مسجل في النظام'
                });
            }

            // تنفيذ التحويل
            const newFromBalance = fromCustomer.balance - amount;
            const newToBalance = toCustomer.balance + amount;

            await Customer.updateBalance(fromCustomerId, newFromBalance);
            await Customer.updateBalance(toCustomer.id, newToBalance);

            // إضافة عمليات للمرسل والمستلم
            const transactionId1 = generateId();
            const transactionId2 = generateId();

            await Transaction.create({
                id: transactionId1,
                customer_id: fromCustomerId,
                type: 'حوالة صادرة',
                description: `تم تحويل مبلغ ${amount} ريال إلى حساب ${toCustomer.name}`,
                amount: -amount,
                balance_before: fromCustomer.balance,
                balance_after: newFromBalance,
                card_number: toCustomer.unique_code,
                points: 0
            });

            await Transaction.create({
                id: transactionId2,
                customer_id: toCustomer.id,
                type: 'حوالة واردة',
                description: `تم استلام مبلغ ${amount} ريال من حساب ${fromCustomer.name}`,
                amount: amount,
                balance_before: toCustomer.balance,
                balance_after: newToBalance,
                card_number: fromCustomer.unique_code,
                points: 0
            });

            // حفظ المستفيد في المفضلة إذا طلب ذلك
            if (saveToFavorites && recipientName && recipientPhone) {
                try {
                    await FavoriteRecipient.create({
                        id: generateId(),
                        customer_id: fromCustomerId,
                        recipient_code: toUniqueCode,
                        recipient_name: recipientName,
                        recipient_phone: recipientPhone
                    });
                } catch (error) {
                    // تجاهل الخطأ إذا كان المستفيد مضافاً مسبقاً
                }
            }

            // إضافة تنبيهات
            await Notification.create({
                id: generateId(),
                customer_id: fromCustomerId,
                type: 'transfer_sent',
                title: 'حوالة صادرة',
                message: `تم تحويل مبلغ ${amount} ريال إلى حساب ${toCustomer.name} (${toCustomer.unique_code}). رصيدك الحالي: ${newFromBalance} ريال`
            });

            await Notification.create({
                id: generateId(),
                customer_id: toCustomer.id,
                type: 'transfer_received',
                title: 'حوالة واردة',
                message: `تم استلام مبلغ ${amount} ريال من حساب ${fromCustomer.name} (${fromCustomer.unique_code}). رصيدك الحالي: ${newToBalance} ريال`
            });

            res.json({
                success: true,
                message: 'تم التحويل بنجاح',
                to_name: toCustomer.name,
                amount: amount,
                new_balance: newFromBalance,
                recipient_balance: newToBalance
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء التحويل: ' + error.message
            });
        }
    }

    // التحقق من كلمة المرور
    static async verifyPassword(req, res) {
        try {
            const { customerId, password } = req.body;

            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            if (customer.password !== password) {
                return res.json({
                    success: false,
                    message: 'كلمة المرور غير صحيحة'
                });
            }

            res.json({
                success: true,
                message: 'كلمة المرور صحيحة'
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء التحقق من كلمة المرور: ' + error.message
            });
        }
    }
}

module.exports = TransferController;