const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

// جلب إشعارات العميل
router.get('/:customerId', NotificationController.getNotifications);

// تعيين إشعار كمقروء
router.post('/mark-read', NotificationController.markAsRead);

// حذف إشعار
router.post('/delete', NotificationController.deleteNotification);

// حذف جميع الإشعارات
router.post('/delete-all', NotificationController.deleteAllNotifications);

// جلب عدد الإشعارات غير المقروءة
router.get('/unread-count/:customerId', NotificationController.getUnreadCount);

module.exports = router;