const GiftPoint = require('../models/GiftPoint');
const Customer = require('../models/Customer');
const Package = require('../models/Package');
const CustomerCard = require('../models/CustomerCard');
const Notification = require('../models/Notification');
const { GIFT_POINTS_SYSTEM, generateId, getPackageDetails } = require('../utils/helpers');

class PointsController {
    // استبدال النقاط
    static async redeemPoints(req, res) {
        try {
            const { customerId, packageName } = req.body;

            const pointsInfo = GIFT_POINTS_SYSTEM[packageName];
            if (!pointsInfo) {
                return res.json({
                    success: false,
                    message: 'هذه الباقة غير متاحة للاستبدال'
                });
            }

            // الحصول على بيانات العميل
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            // التحقق من النقاط
            if (customer.gift_points < pointsInfo.target) {
                return res.json({
                    success: false,
                    message: `نقاطك غير كافية. تحتاج ${pointsInfo.target} نقطة`
                });
            }

            // البحث عن بطاقة متاحة
            const availablePackage = await Package.findAvailableByName(pointsInfo.reward);
            if (!availablePackage) {
                return res.json({
                    success: false,
                    message: 'لا توجد بطاقات متاحة حالياً، سيتم إضافتها قريباً'
                });
            }

            // تحديث الباقة لتصبح مستخدمة
            await Package.markAsUsed(availablePackage.id, customerId);

            // تحديث نقاط العميل
            const newPoints = customer.gift_points - pointsInfo.target;
            await Customer.updatePoints(customerId, newPoints);

            // إضافة سجل استبدال النقاط
            await GiftPoint.create({
                id: generateId(),
                customer_id: customerId,
                type: 'استبدال',
                points: -pointsInfo.target,
                balance_before: customer.gift_points,
                balance_after: newPoints,
                description: `استبدال نقاط ${pointsInfo.reward}`
            });

            // إضافة البطاقة إلى بطاقات العميل
            await CustomerCard.create({
                id: generateId(),
                customer_id: customerId,
                package_name: availablePackage.name,
                duration: availablePackage.duration,
                price: 0,
                data_amount: availablePackage.data_amount,
                card_number: availablePackage.card_number,
                acquisition_type: 'استبدال نقاط'
            });

            // إضافة تنبيه
            await Notification.create({
                id: generateId(),
                customer_id: customerId,
                type: 'gift_redeem',
                title: 'تم الاستبدال بنجاح!',
                message: `لقد استبدلت ${pointsInfo.target} نقطة وحصلت على ${pointsInfo.reward} مجاناً! رقم الكرت: ${availablePackage.card_number}`
            });

            res.json({
                success: true,
                message: `تم استبدال ${pointsInfo.target} نقطة بنجاح!`,
                card_number: availablePackage.card_number,
                package_name: pointsInfo.reward,
                new_points: newPoints
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء استبدال النقاط: ' + error.message
            });
        }
    }

    // جلب سجل النقاط
    static async getPointsHistory(req, res) {
        try {
            const { customerId } = req.params;
            const pointsHistory = await GiftPoint.findByCustomerId(customerId);

            res.json({
                success: true,
                points_history: pointsHistory
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب سجل النقاط: ' + error.message
            });
        }
    }

    // جلب إحصائيات النقاط
    static async getPointsSummary(req, res) {
        try {
            const { customerId } = req.params;
            const summary = await GiftPoint.getCustomerPointsSummary(customerId);

            res.json({
                success: true,
                summary: summary
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب إحصائيات النقاط: ' + error.message
            });
        }
    }

    // جلب نظام نقاط الهدايا
    static async getGiftPointsSystem(req, res) {
        try {
            res.json({
                success: true,
                gift_system: GIFT_POINTS_SYSTEM
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب نظام النقاط: ' + error.message
            });
        }
    }
}

module.exports = PointsController;