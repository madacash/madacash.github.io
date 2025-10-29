const { v4: uuidv4 } = require('uuid');

// توليد كود مميز فريد
function generateUniqueCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const numbers = String(Math.floor(1000 + Math.random() * 9000));
    return letter + numbers;
}

// التحقق من صحة كلمة المرور
function isValidPassword(password) {
    const englishPattern = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return englishPattern.test(password);
}

// تفاصيل الباقات
function getPackageDetails(packageName) {
    const packages = {
        'باقة يوم': {
            duration: 'يوم واحد',
            price: 200,
            dataAmount: '1 جيجا'
        },
        'باقة أسبوع': {
            duration: 'أسبوع',
            price: 500,
            dataAmount: '5 جيجا'
        },
        'باقة أسبوعين': {
            duration: 'أسبوعين',
            price: 1500,
            dataAmount: '15 جيجا'
        },
        'باقة شهر': {
            duration: 'شهر',
            price: 2500,
            dataAmount: '30 جيجا'
        },
        'باقة شهر 70 المنزلية': {
            duration: 'شهر',
            price: 6000,
            dataAmount: '70 جيجا'
        },
        'باقة شهر 150 المنزلية': {
            duration: 'شهر',
            price: 12000,
            dataAmount: '150 جيجا'
        }
    };
    return packages[packageName];
}

// نظام نقاط الهدايا
const GIFT_POINTS_SYSTEM = {
    'باقة يوم': { points: 2, target: 20, reward: 'باقة يوم' },
    'باقة أسبوع': { points: 4, target: 60, reward: 'باقة أسبوع' },
    'باقة أسبوعين': { points: 5, target: 100, reward: 'باقة أسبوعين' },
    'باقة شهر': { points: 8, target: 200, reward: 'باقة شهر' }
};

// تنسيق العملة
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US').format(amount);
}

// إنشاء UUID
function generateId() {
    return uuidv4();
}

module.exports = {
    generateUniqueCode,
    isValidPassword,
    getPackageDetails,
    GIFT_POINTS_SYSTEM,
    formatCurrency,
    generateId
};