const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');

// تحديث الملف الشخصي
router.post('/update', ProfileController.updateProfile);

// جلب إحصائيات العميل
router.get('/stats/:customerId', ProfileController.getCustomerStats);

module.exports = router;