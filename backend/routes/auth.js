const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// تسجيل عميل جديد
router.post('/register', AuthController.register);

// تسجيل الدخول
router.post('/login', AuthController.login);

// الحصول على بيانات العميل
router.get('/customer/:customerId', AuthController.getCustomer);

// الحصول على العميل بواسطة الكود المميز
router.get('/customer-by-code/:uniqueCode', AuthController.getCustomerByCode);

module.exports = router;