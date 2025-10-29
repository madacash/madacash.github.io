const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { generateUniqueCode, isValidPassword, generateId } = require('../utils/helpers');

class AuthController {
    // تسجيل عميل جديد
    static async register(req, res) {
        try {
            const { name, area, phone, password, bank_account_number, bank_type } = req.body;

            // تنظيف المدخلات
            const cleanPhone = phone.trim();
            const cleanPassword = password.trim();
            const cleanName = name.trim();
            const cleanArea = area.trim();
            const cleanBankAccountNumber = bank_account_number ? bank_account_number.trim() : '';
            const cleanBankType = bank_type ? bank_type.trim() : '';

            // التحقق من صحة كلمة المرور
            if (!isValidPassword(cleanPassword)) {
                return res.json({
                    success: false,
                    message: 'كلمة المرور يجب أن تحتوي على أحرف إنجليزية وأرقام ورموز فقط'
                });
            }

            // التحقق من وجود رقم الجوال مسبقاً
            const existingCustomer = await Customer.findByPhone(cleanPhone);
            if (existingCustomer) {
                return res.json({
                    success: false,
                    message: 'رقم الجوال مسجل مسبقاً'
                });
            }

            // توليد كود مميز فريد
            let uniqueCode;
            let codeExists = true;
            while (codeExists) {
                uniqueCode = generateUniqueCode();
                const existing = await Customer.findByCode(uniqueCode);
                codeExists = !!existing;
            }

            const customerId = generateId();

            // إنشاء العميل
            await Customer.create({
                id: customerId,
                name: cleanName,
                area: cleanArea,
                phone: cleanPhone,
                unique_code: uniqueCode,
                password: cleanPassword,
                balance: 0,
                gift_points: 0,
                bank_account_number: cleanBankAccountNumber,
                bank_type: cleanBankType
            });

            // إضافة تنبيه ترحيبي
            await Notification.create({
                id: generateId(),
                customer_id: customerId,
                type: 'welcome',
                title: 'مرحباً بك!',
                message: `أهلاً ${cleanName}، تم إنشاء حسابك بنجاح. كودك المميز: ${uniqueCode}`
            });

            res.json({
                success: true,
                customer: {
                    id: customerId,
                    name: cleanName,
                    area: cleanArea,
                    phone: cleanPhone,
                    unique_code: uniqueCode,
                    balance: 0,
                    gift_points: 0,
                    bank_account_number: cleanBankAccountNumber,
                    bank_type: cleanBankType
                }
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء التسجيل: ' + error.message
            });
        }
    }

    // تسجيل الدخول
    static async login(req, res) {
        try {
            const { phone, password } = req.body;
            const cleanPhone = phone.trim();
            const cleanPassword = password.trim();

            const customer = await Customer.findByPhone(cleanPhone);
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'رقم الجوال غير مسجل'
                });
            }

            if (customer.password !== cleanPassword) {
                return res.json({
                    success: false,
                    message: 'كلمة المرور غير صحيحة'
                });
            }

            // تحديث آخر دخول
            await Customer.updateLastLogin(customer.id);

            res.json({
                success: true,
                customer: customer
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء تسجيل الدخول: ' + error.message
            });
        }
    }

    // الحصول على بيانات العميل
    static async getCustomer(req, res) {
        try {
            const { customerId } = req.params;
            const customer = await Customer.findById(customerId);
            
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'العميل غير موجود'
                });
            }

            res.json({
                success: true,
                customer: customer
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب البيانات: ' + error.message
            });
        }
    }

    // الحصول على العميل بواسطة الكود المميز
    static async getCustomerByCode(req, res) {
        try {
            const { uniqueCode } = req.params;
            const customer = await Customer.findByCode(uniqueCode);
            
            if (!customer) {
                return res.json({
                    success: false,
                    message: 'الكود المميز غير مسجل'
                });
            }

            res.json({
                success: true,
                customer: customer
            });

        } catch (error) {
            res.json({
                success: false,
                message: 'حدث خطأ أثناء جلب البيانات: ' + error.message
            });
        }
    }
}

module.exports = AuthController;