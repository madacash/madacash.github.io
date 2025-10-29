const Notification = require('../models/Notification');
const { generateId } = require('../utils/helpers');

class NotificationController {
    // جلب إشعارات العميل
    static async getNotifications(req, res) {
        try {
            const { customerId } = req.params;
            const notifications = await Notification.findByCustomerId(customerId);

            res.json({
                success: true,
                notifications: notifications
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب الإشعارات: ' + error.message
            });
        }
    }

    // تعيين إشعار كمقروء
    static async markAsRead(req, res) {
        try {
            const { notificationId } = req.body;
            await Notification.markAsRead(notificationId);

            res.json({
                success: true,
                message: 'تم تعيين الإشعار كمقروء'
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء تحديث الإشعار: ' + error.message
            });
        }
    }

    // حذف إشعار
    static async deleteNotification(req, res) {
        try {
            const { notificationId } = req.body;
            await Notification.delete(notificationId);

            res.json({
                success: true,
                message: 'تم حذف التنبيه بنجاح'
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء حذف التنبيه: ' + error.message
            });
        }
    }

    // حذف جميع إشعارات العميل
    static async deleteAllNotifications(req, res) {
        try {
            const { customerId } = req.body;
            await Notification.deleteAllByCustomer(customerId);

            res.json({
                success: true,
                message: 'تم مسح جميع التنبيهات'
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء مسح التنبيهات: ' + error.message
            });
        }
    }

    // جلب عدد الإشعارات غير المقروءة
    static async getUnreadCount(req, res) {
        try {
            const { customerId } = req.params;
            const count = await Notification.getUnreadCount(customerId);

            res.json({
                success: true,
                unread_count: count
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب عدد الإشعارات: ' + error.message
            });
        }
    }
}

module.exports = NotificationController;