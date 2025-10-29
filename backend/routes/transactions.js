const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');

// جلب عمليات العميل
router.get('/:customerId', TransactionController.getTransactions);

// جلب إحصائيات العميل
router.get('/stats/:customerId', TransactionController.getCustomerStats);

module.exports = router;