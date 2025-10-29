const express = require('express');
const router = express.Router();
const RechargeController = require('../controllers/rechargeController');

// شحن الرصيد
router.post('/', RechargeController.rechargeBalance);

// جلب بطاقات الشحن المتاحة
router.get('/available-cards', RechargeController.getAvailableRechargeCards);

module.exports = router;