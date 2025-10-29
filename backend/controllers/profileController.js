const Customer = require('../models/Customer');
const { isValidPassword } = require('../utils/helpers');

class ProfileController {
    // تحديث الملف الشخصي
    static async updateProfile(req, res) {
        try {
            const { customerId, updates, currentPassword } = req.body;

            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            // التحقق من كلمة المرور الحالية إذا تم تقديم كلمة مرور جديدة
            if (updates.password && updates.password.trim() !== '') {
                if (!currentPassword) {
                    return res.json({
                        success: false,
                        message: 'يجب إدخال كلمة المرور الحالية لتغيير كلمة المرور'
                    });
                }

                if (currentPassword !== customer.password) {
                    return res.json({
                        success: false,
                        message: 'كلمة المرور الحالية غير صحيحة'
                    });
                }

                // التحقق من صحة كلمة المرور الجديدة
                if (!isValidPassword(updates.password)) {
                    return res.json({
                        success: false,
                        message: 'كلمة المرور الجديدة يجب أن تحتوي على أحرف إنجليزية وأرقام ورموز فقط'
                    });
                }
            }

            // التحقق من عدم تكرار رقم الجوال إذا تم تحديثه
            if (updates.phone) {
                const existingCustomer = await Customer.findByPhone(updates.phone);
                if (existingCustomer && existingCustomer.id !== customerId) {
                    return res.json({
                        success: false,
                        message: 'رقم الجوال مسجل مسبقاً'
                    });
                }
            }

            // تحديث البيانات
            await Customer.updateProfile(customerId, updates);

            // جلب البيانات المحدثة
            const updatedCustomer = await Customer.findById(customerId);

            res.json({
                success: true,
                message: 'تم تحديث البيانات بنجاح',
                customer: updatedCustomer
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء التحديث: ' + error.message
            });
        }
    }

    // جلب الإحصائيات
    static async getCustomerStats(req, res) {
        try {
            const { customerId } = req.params;
            
            const customer = await Customer.findById(customerId);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            // جلب إحصائيات العميل (سيتم تنفيذها في Transaction model)
            const stats = {
                currentBalance: customer.balance,
                currentPoints: customer.gift_points,
                // سيتم إضافة المزيد من الإحصائيات
            };

            res.json({
                success: true,
                stats: stats
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب الإحصائيات: ' + error.message
            });
        }
    }
}

module.exports = ProfileController;