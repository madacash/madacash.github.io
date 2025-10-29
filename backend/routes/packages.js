const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/packageController');

// الحصول على جميع الباقات
router.get('/', PackageController.getPackages);

// شراء باقة
router.post('/purchase', PackageController.purchasePackage);

// جلب بطاقات العميل
router.get('/customer-cards/:customerId', PackageController.getCustomerCards);

// جلب إحصائيات بطاقات العميل
router.get('/customer-stats/:customerId', PackageController.getCustomerCardsStats);

module.exports = router;