const express = require('express');
const router = express.Router();
const PointsController = require('../controllers/pointsController');

// استبدال النقاط
router.post('/redeem', PointsController.redeemPoints);

// جلب سجل النقاط
router.get('/history/:customerId', PointsController.getPointsHistory);

// جلب إحصائيات النقاط
router.get('/summary/:customerId', PointsController.getPointsSummary);

// جلب نظام نقاط الهدايا
router.get('/gift-system', PointsController.getGiftPointsSystem);

module.exports = router;