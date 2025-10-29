// إدارة المصادقة
class AuthManager {
    constructor(app) {
        this.app = app;
        this.initAuthEvents();
    }

    initAuthEvents() {
        // تسجيل الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // التسجيل
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const phone = document.getElementById('loginPhone').value;
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('loginBtn');

        try {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i data-feather="loader"></i> جاري تسجيل الدخول...';
            feather.replace();

            const response = await fetch(`${this.app.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, password })
            });

            const data = await response.json();

            if (data.success) {
                this.app.currentCustomer = data.customer;
                localStorage.setItem('madaCashCustomer', JSON.stringify(data.customer));
                this.app.showSuccess('تم تسجيل الدخول بنجاح');
                this.app.loadDashboard();
            } else {
                this.app.showError(data.message);
            }

        } catch (error) {
            this.app.showError('حدث خطأ في الاتصال بالخادم');
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i data-feather="log-in"></i> تسجيل الدخول';
            feather.replace();
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const area = document.getElementById('registerArea').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const bankType = document.getElementById('registerBankType').value;
        const bankAccount = document.getElementById('registerBankAccount').value;
        const registerBtn = document.getElementById('registerBtn');

        // التحقق من تطابق كلمات المرور
        if (password !== confirmPassword) {
            this.app.showError('كلمات المرور غير متطابقة');
            return;
        }

        try {
            registerBtn.disabled = true;
            registerBtn.innerHTML = '<i data-feather="loader"></i> جاري إنشاء الحساب...';
            feather.replace();

            const response = await fetch(`${this.app.baseURL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    area,
                    phone,
                    password,
                    bank_account_number: bankAccount,
                    bank_type: bankType
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showRegistrationSuccess(data.customer);
            } else {
                this.app.showError(data.message);
            }

        } catch (error) {
            this.app.showError('حدث خطأ في الاتصال بالخادم');
        } finally {
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i data-feather="user-plus"></i> إنشاء الحساب';
            feather.replace();
        }
    }

    showRegistrationSuccess(customer) {
        document.getElementById('successPhone').textContent = customer.phone;
        document.getElementById('successCode').textContent = customer.unique_code;
        this.app.showScreen('successScreen');
    }

    loginWithRegisteredData() {
        const phone = document.getElementById('successPhone').textContent;
        document.getElementById('loginPhone').value = phone;
        this.app.showScreen('loginScreen');
    }

    logout() {
        this.app.currentCustomer = null;
        localStorage.removeItem('madaCashCustomer');
        this.app.showScreen('loginScreen');
        this.app.showSuccess('تم تسجيل الخروج بنجاح');
    }
}

// تهيئة مدير المصادقة
const authManager = new AuthManager(app);

// جعل الدوال متاحة globally للاستخدام في HTML
window.showRegister = showRegister;
window.showLogin = showLogin;
window.togglePassword = togglePassword;
window.copyToClipboard = copyToClipboard;
window.closeAllModals = closeAllModals;
window.openHelpModal = openHelpModal;
window.openTermsModal = openTermsModal;
window.loginWithRegisteredData = () => authManager.loginWithRegisteredData();
window.logout = () => authManager.logout();