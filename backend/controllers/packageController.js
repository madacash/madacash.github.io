const Package = require('../models/Package');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const CustomerCard = require('../models/CustomerCard');
const GiftPoint = require('../models/GiftPoint');
const Notification = require('../models/Notification');
const { getPackageDetails, GIFT_POINTS_SYSTEM, generateId } = require('../utils/helpers');

class PackageController {
    // الحصول على جميع الباقات المتاحة
    static async getPackages(req, res) {
        try {
            const packages = await Package.getAllPackages();
            
            // إضافة نقاط الهدايا لكل باقة
            const packagesWithPoints = packages.map(pkg => ({
                ...pkg,
                gift_points: GIFT_POINTS_SYSTEM[pkg.name] ? GIFT_POINTS_SYSTEM[pkg.name].points : 0
            }));

            res.json({
                success: true,
                packages: packagesWithPoints
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب الباقات: ' + error.message
            });
        }
    }

    // شراء باقة
    static async purchasePackage(req, res) {
        try {
            const { customerId, packageName } = req.body;

            // التحقق من وجود العميل
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            // الحصول على تفاصيل الباقة
            const packageDetails = getPackageDetails(packageName);
            if (!packageDetails) {
                return res.json({
                    success: false,
                    message: 'نوع الباقة غير معروف'
                });
            }

            // التحقق من الرصيد
            if (customer.balance < packageDetails.price) {
                return res.json({
                    success: false,
                    message: 'الرصيد غير كافٍ'
                });
            }

            // البحث عن بطاقة متاحة
            const availablePackage = await Package.findAvailableByName(packageName);
            if (!availablePackage) {
                return res.json({
                    success: false,
                    message: 'لا توجد بطاقات متاحة لهذه الباقة'
                });
            }

            // تحديث رصيد العميل
            const newBalance = customer.balance - packageDetails.price;
            await Customer.updateBalance(customerId, newBalance);

            // تحديث الباقة كمستخدمة
            await Package.markAsUsed(availablePackage.id, customerId);

            // إضافة البطاقة إلى بطاقات العميل
            await CustomerCard.create({
                id: generateId(),
                customer_id: customerId,
                package_name: packageName,
                duration: packageDetails.duration,
                price: packageDetails.price,
                data_amount: packageDetails.dataAmount,
                card_number: availablePackage.card_number,
                acquisition_type: 'شراء'
            });

            // إضافة عملية الشراء
            const transactionId = generateId();
            await Transaction.create({
                id: transactionId,
                customer_id: customerId,
                type: 'شراء',
                description: `شراء ${packageName}`,
                amount: -packageDetails.price,
                balance_before: customer.balance,
                balance_after: newBalance,
                card_number: availablePackage.card_number,
                points: GIFT_POINTS_SYSTEM[packageName] ? GIFT_POINTS_SYSTEM[packageName].points : 0
            });

            // إضافة نقاط الهدايا إذا كانت الباقة تدعمها
            if (GIFT_POINTS_SYSTEM[packageName]) {
                const pointsInfo = GIFT_POINTS_SYSTEM[packageName];
                const newPoints = customer.gift_points + pointsInfo.points;
                
                await Customer.updatePoints(customerId, newPoints);
                
                await GiftPoint.create({
                    id: generateId(),
                    customer_id: customerId,
                    type: 'اكتساب',
                    points: pointsInfo.points,
                    balance_before: customer.gift_points,
                    balance_after: newPoints,
                    description: `شراء ${packageName}`
                });
            }

            // إضافة تنبيه
            await Notification.create({
                id: generateId(),
                customer_id: customerId,
                type: 'purchase',
                title: 'تم شراء الباقة بنجاح',
                message: `تم شراء ${packageName} بنجاح! رقم الكرت: ${availablePackage.card_number}. تم خصم ${packageDetails.price} ريال من رصيدك.`
            });

            res.json({
                success: true,
                message: 'تم شراء الباقة بنجاح',
                card_number: availablePackage.card_number,
                package_name: packageName,
                new_balance: newBalance
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء شراء الباقة: ' + error.message
            });
        }
    }

    // جلب بطاقات العميل
    static async getCustomerCards(req, res) {
        try {
            const { customerId } = req.params;
            const cards = await CustomerCard.findByCustomerId(customerId);

            res.json({
                success: true,
                cards: cards
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب البطاقات: ' + error.message
            });
        }
    }

    // إحصائيات بطاقات العميل
    static async getCustomerCardsStats(req, res) {
        try {
            const { customerId } = req.params;
            const stats = await CustomerCard.getCustomerStats(customerId);

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

module.exports = PackageController;