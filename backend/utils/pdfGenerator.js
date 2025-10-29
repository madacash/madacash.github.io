const PDFDocument = require('pdfkit');
const { formatCurrency } = require('./helpers');

class PDFGenerator {
    // إنشاء تقرير التحويل
    static createTransferPDF(transferData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    resolve(pdfBuffer);
                });

                // إضافة محتوى PDF
                doc.fontSize(20).text('إشعار تحويل رصيد', { align: 'center' });
                doc.moveDown();
                
                doc.fontSize(14);
                doc.text(`حوالة صادرة من حساب: ${transferData.sender_name}`);
                doc.text(`رقم الكود المميز: ${transferData.sender_code}`);
                doc.text(`مبلغ الحوالة: ${formatCurrency(transferData.amount)} ريال`);
                doc.text(`إلى حساب: ${transferData.recipient_name}`);
                doc.text(`رقم الكود المميز: ${transferData.recipient_code}`);
                doc.text(`تاريخ العملية: ${transferData.transfer_date}`);
                
                doc.moveDown();
                doc.text('هذا الإشعار رسمي تم إنشاؤه تلقائياً من مدى كاش', { align: 'center' });

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    // إنشاء تقرير العمليات
    static createTransactionsPDF(customer, transactions, startDate, endDate) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    resolve(pdfBuffer);
                });

                // العنوان
                doc.fontSize(20).text('تقرير سجل العمليات', { align: 'center' });
                doc.moveDown();

                // معلومات العميل
                doc.fontSize(12);
                doc.text(`اسم العميل: ${customer.name}`);
                doc.text(`رقم الجوال: ${customer.phone}`);
                doc.text(`الكود المميز: ${customer.unique_code}`);
                doc.text(`الفترة من: ${startDate} إلى: ${endDate}`);
                doc.moveDown();

                // جدول العمليات
                if (transactions.length > 0) {
                    transactions.forEach((transaction, index) => {
                        doc.text(`${index + 1}. ${transaction.type} - ${transaction.description} - ${formatCurrency(transaction.amount)} ريال`);
                    });
                } else {
                    doc.text('لا توجد عمليات في الفترة المحددة', { align: 'center' });
                }

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = PDFGenerator;