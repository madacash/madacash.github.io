const express = require('express');
const router = express.Router();
const TransferController = require('../controllers/transferController');

// تحويل الرصيد
router.post('/', TransferController.transferBalance);

// التحقق من كلمة المرور
router.post('/verify-password', TransferController.verifyPassword);

module.exports = router;