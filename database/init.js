const Customer = require('../models/Customer');
const Package = require('../models/Package');
const Transaction = require('../models/Transaction');
const RechargeCard = require('../models/RechargeCard');
const Notification = require('../models/Notification');
const GiftPoint = require('../models/GiftPoint');
const CustomerCard = require('../models/CustomerCard');
const FavoriteRecipient = require('../models/FavoriteRecipient');

async function initializeDatabase() {
    try {
        console.log('جاري تهيئة قاعدة البيانات...');

        // إنشاء الجداول
        await Customer.createTable();
        await Package.createTable();
        await Transaction.createTable();
        await RechargeCard.createTable();
        await Notification.createTable();
        await GiftPoint.createTable();
        await CustomerCard.createTable();
        await FavoriteRecipient.createTable();

        console.log('✅ تم إنشاء جميع الجداول بنجاح');

        // إدخال بيانات الباقات الافتراضية
        const packages = [
            { id: 'pkg-1', name: 'باقة يوم', duration: 'يوم واحد', price: 200, data_amount: '1 جيجا', card_number: 'DAY001', used: 0 },
            { id: 'pkg-2', name: 'باقة يوم', duration: 'يوم واحد', price: 200, data_amount: '1 جيجا', card_number: 'DAY002', used: 0 },
            { id: 'pkg-3', name: 'باقة أسبوع', duration: 'أسبوع', price: 500, data_amount: '5 جيجا', card_number: 'WEEK001', used: 0 },
            { id: 'pkg-4', name: 'باقة أسبوع', duration: 'أسبوع', price: 500, data_amount: '5 جيجا', card_number: 'WEEK002', used: 0 },
            { id: 'pkg-5', name: 'باقة أسبوعين', duration: 'أسبوعين', price: 1500, data_amount: '15 جيجا', card_number: 'TWOWEEK001', used: 0 },
            { id: 'pkg-6', name: 'باقة أسبوعين', duration: 'أسبوعين', price: 1500, data_amount: '15 جيجا', card_number: 'TWOWEEK002', used: 0 },
            { id: 'pkg-7', name: 'باقة شهر', duration: 'شهر', price: 2500, data_amount: '30 جيجا', card_number: 'MONTH001', used: 0 },
            { id: 'pkg-8', name: 'باقة شهر', duration: 'شهر', price: 2500, data_amount: '30 جيجا', card_number: 'MONTH002', used: 0 }
        ];

        for (const pkg of packages) {
            await Package.create(pkg);
        }

        // إدخال بطاقات شحن افتراضية
        const rechargeCards = [
            { card_number: 'RCH6000001', amount: 6000, used: 0 },
            { card_number: 'RCH6000002', amount: 6000, used: 0 },
            { card_number: 'RCH12000001', amount: 12000, used: 0 },
            { card_number: 'RCH12000002', amount: 12000, used: 0 }
        ];

        for (const card of rechargeCards) {
            await RechargeCard.create(card);
        }

        console.log('✅ تم إدخال البيانات الافتراضية بنجاح');
        console.log('🎉 اكتملت تهيئة قاعدة البيانات!');

    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
    }
}

// تشغيل التهيئة إذا تم تنفيذ الملف مباشرة
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;