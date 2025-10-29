// إدارة Dashboard
class DashboardManager {
    constructor(app) {
        this.app = app;
        this.currentTab = 'packages';
        this.initDashboard();
    }

    initDashboard() {
        this.loadUserData();
        this.initTabEvents();
        this.loadNotifications();
        this.showTab('packages');
    }

    loadUserData() {
        if (this.app.currentCustomer) {
            document.getElementById('userName').textContent = `مرحبًا ${this.app.currentCustomer.name}`;
            document.getElementById('userCode').textContent = this.app.currentCustomer.unique_code;
            document.getElementById('userBalance').textContent = `${this.app.formatCurrency(this.app.currentCustomer.balance)} ريال`;
            document.getElementById('userPoints').textContent = `${this.app.formatCurrency(this.app.currentCustomer.gift_points)} نقطة`;
            
            // تحديث بيانات الملف الشخصي
            document.getElementById('profileName').textContent = this.app.currentCustomer.name;
            document.getElementById('profileArea').textContent = this.app.currentCustomer.area;
            document.getElementById('profilePhone').textContent = this.app.currentCustomer.phone;
            document.getElementById('profileBankAccount').textContent = this.app.currentCustomer.bank_account_number || '-';
            document.getElementById('profileBankType').textContent = this.app.currentCustomer.bank_type || '-';
            document.getElementById('profileUniqueCode').textContent = this.app.currentCustomer.unique_code;
        }
    }

    initTabEvents() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showTab(tabName);
            });
        });
    }

    showTab(tabName) {
        // إخفاء جميع التبويبات
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });

        // إلغاء تنشيط جميع أزرار التبويب
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // إظهار التبويب المطلوب
        const targetTab = document.getElementById(`${tabName}Tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // تنشيط زر التبويب
        const targetNavTab = document.querySelector(`.nav-tab[onclick*="${tabName}"]`);
        if (targetNavTab) {
            targetNavTab.classList.add('active');
        }

        this.currentTab = tabName;

        // تحميل محتوى التبويب
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch(tabName) {
            case 'packages':
                this.loadPackages();
                break;
            case 'myCards':
                this.loadMyCards();
                break;
            case 'points':
                this.loadPoints();
                break;
            case 'recharge':
                this.loadRecharge();
                break;
            case 'transfer':
                this.loadTransfer();
                break;
            case 'history':
                this.loadHistory();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    async loadPackages() {
        try {
            const response = await fetch(`${this.app.baseURL}/api/packages`);
            const data = await response.json();

            if (data.success) {
                this.displayPackages(data.packages);
            } else {
                this.app.showError(data.message);
            }
        } catch (error) {
            this.app.showError('حدث خطأ في تحميل الباقات');
        }
    }

    displayPackages(packages) {
        const packagesList = document.getElementById('packagesList');
        
        if (packages.length === 0) {
            packagesList.innerHTML = '<div class="empty-state">لا توجد باقات متاحة حالياً</div>';
            return;
        }

        packagesList.innerHTML = packages.map(pkg => `
            <div class="package-card">
                <div class="package-header">
                    <div class="package-name">${pkg.name}</div>
                    <div class="package-price">${this.app.formatCurrency(pkg.price)}</div>
                    <div class="package-currency">ريال</div>
                </div>
                <div class="package-body">
                    <div class="package-feature">
                        <span class="feature-label">المدة</span>
                        <span class="feature-value">${pkg.duration}</span>
                    </div>
                    <div class="package-feature">
                        <span class="feature-label">حجم البيانات</span>
                        <span class="feature-value">${pkg.data_amount}</span>
                    </div>
                    <div class="package-feature">
                        <span class="feature-label">نقاط الهدايا</span>
                        <span class="feature-value">+${pkg.gift_points} نقطة</span>
                    </div>
                    <button class="package-btn" onclick="dashboard.purchasePackage('${pkg.name}')">
                        <i data-feather="shopping-cart"></i> شراء الباقة
                    </button>
                </div>
            </div>
        `).join('');

        feather.replace();
    }

    async purchasePackage(packageName) {
        if (!this.app.currentCustomer) return;

        const packageDetails = this.getPackageDetails(packageName);
        if (!packageDetails) return;

        // التحقق من الرصيد
        if (this.app.currentCustomer.balance < packageDetails.price) {
            this.app.showError('رصيدك غير كافٍ لشراء هذه الباقة');
            return;
        }

        // عرض نافذة التأكيد
        document.getElementById('purchaseConfirmMessage').textContent = 
            `هل أنت متأكد من شراء باقة ${packageName} بقيمة ${this.app.formatCurrency(packageDetails.price)} ريال؟`;
        
        this.showModal('purchaseConfirmModal');
        this.currentPackage = packageName;
    }

    async confirmPurchase() {
        if (!this.app.currentCustomer || !this.currentPackage) return;

        try {
            const response = await fetch(`${this.app.baseURL}/api/packages/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: this.app.currentCustomer.id,
                    packageName: this.currentPackage
                })
            });

            const data = await response.json();

            if (data.success) {
                this.closeModal('purchaseConfirmModal');
                this.showPurchaseSuccess(data);
                this.app.currentCustomer.balance = data.new_balance;
                this.loadUserData();
            } else {
                this.app.showError(data.message);
            }
        } catch (error) {
            this.app.showError('حدث خطأ في عملية الشراء');
        }
    }

    showPurchaseSuccess(data) {
        document.getElementById('purchasedCardNumber').textContent = data.card_number;
        this.showModal('purchaseSuccessModal');
    }

    // دوال المساعدة
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.getElementById('overlay').classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.getElementById('overlay').classList.remove('show');
    }

    getPackageDetails(packageName) {
        const packages = {
            'باقة يوم': { price: 200 },
            'باقة أسبوع': { price: 500 },
            'باقة أسبوعين': { price: 1500 },
            'باقة شهر': { price: 2500 },
            'باقة شهر 70 المنزلية': { price: 6000 },
            'باقة شهر 150 المنزلية': { price: 12000 }
        };
        return packages[packageName];
    }

    async loadNotifications() {
        if (!this.app.currentCustomer) return;

        try {
            const response = await fetch(`${this.app.baseURL}/api/notifications/${this.app.currentCustomer.id}`);
            const data = await response.json();

            if (data.success) {
                this.displayNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    displayNotifications(notifications) {
        const notificationsList = document.getElementById('notificationsList');
        const notificationBadge = document.getElementById('notificationBadge');
        const notificationsCount = document.getElementById('notificationsCount');

        if (notifications.length === 0) {
            notificationsList.innerHTML = '<div class="empty-state">لا توجد تنبيهات</div>';
            notificationBadge.style.display = 'none';
            notificationsCount.textContent = '0 تنبيه';
            return;
        }

        const unreadCount = notifications.filter(n => !n.is_read).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        notificationsCount.textContent = `${notifications.length} تنبيه`;

        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.is_read ? 'read' : 'unread'}" onclick="dashboard.markNotificationAsRead('${notification.id}')">
                ${!notification.is_read ? '<div class="notification-read-indicator"></div>' : ''}
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${this.app.formatDate(notification.created_at)}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
                <button class="notification-delete-btn" onclick="event.stopPropagation(); dashboard.deleteNotification('${notification.id}')">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
        `).join('');

        feather.replace();
    }

    async markNotificationAsRead(notificationId) {
        try {
            await fetch(`${this.app.baseURL}/api/notifications/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId })
            });

            this.loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async deleteNotification(notificationId) {
        try {
            await fetch(`${this.app.baseURL}/api/notifications/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notificationId })
            });

            this.loadNotifications();
            this.app.showSuccess('تم حذف التنبيه بنجاح');
        } catch (error) {
            this.app.showError('حدث خطأ أثناء حذف التنبيه');
        }
    }

    async deleteAllNotifications() {
        if (!this.app.currentCustomer) return;

        try {
            await fetch(`${this.app.baseURL}/api/notifications/delete-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ customerId: this.app.currentCustomer.id })
            });

            this.loadNotifications();
            this.app.showSuccess('تم مسح جميع التنبيهات بنجاح');
        } catch (error) {
            this.app.showError('حدث خطأ أثناء مسح التنبيهات');
        }
    }
}

// تهيئة Dashboard
let dashboard;

function initDashboard() {
    dashboard = new DashboardManager(app);
    feather.replace();
}

// جعل الدوال متاحة globally
window.showTab = (tabName) => dashboard.showTab(tabName);
window.toggleNotifications = () => {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('open');
};
window.closeNotifications = () => {
    document.getElementById('notificationsPanel').classList.remove('open');
};
window.showBalanceStats = () => dashboard.showModal('balanceStatsModal');
window.closeBalanceStatsModal = () => dashboard.closeModal('balanceStatsModal');
window.confirmPurchase = () => dashboard.confirmPurchase();
window.closePurchaseConfirmModal = () => dashboard.closeModal('purchaseConfirmModal');
window.closePurchaseSuccessModal = () => dashboard.closeModal('purchaseSuccessModal');
window.copyPurchasedCardNumber = () => {
    const cardNumber = document.getElementById('purchasedCardNumber').textContent;
    navigator.clipboard.writeText(cardNumber).then(() => {
        app.showSuccess('تم نسخ رقم الكرت إلى الحافظة');
    });
};