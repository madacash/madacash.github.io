// تطبيق Mada Cash الرئيسي
class MadaCashApp {
    constructor() {
        this.currentCustomer = null;
        this.baseURL = window.location.origin;
        this.init();
    }

    init() {
        this.initializeFeatherIcons();
        this.showWelcomeScreen();
        this.checkAuthentication();
    }

    initializeFeatherIcons() {
        feather.replace();
    }

    showWelcomeScreen() {
        setTimeout(() => {
            document.getElementById('welcomeScreen').style.display = 'none';
            this.showScreen('loginScreen');
        }, 2000);
    }

    showScreen(screenId) {
        // إخفاء جميع الشاشات
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    checkAuthentication() {
        const savedCustomer = localStorage.getItem('madaCashCustomer');
        if (savedCustomer) {
            this.currentCustomer = JSON.parse(savedCustomer);
            this.loadDashboard();
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch(`${this.baseURL}/api/dashboard.html`);
            const dashboardHTML = await response.text();
            document.getElementById('dashboardScreen').innerHTML = dashboardHTML;
            this.showScreen('dashboardScreen');
            this.initializeDashboard();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    initializeDashboard() {
        // سيتم تهيئة Dashboard هنا
        feather.replace();
    }

    showToast(title, message, duration = 3000) {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    showError(message) {
        this.showToast('خطأ', message, 5000);
    }

    showSuccess(message) {
        this.showToast('نجاح', message, 3000);
    }

    // دوال المساعدة
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US').format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// تهيئة التطبيق
const app = new MadaCashApp();

// دوال عامة
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        feather.replace(icon, 'eye-off');
    } else {
        input.type = 'password';
        feather.replace(icon, 'eye');
    }
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        app.showSuccess('تم النسخ إلى الحافظة');
    }).catch(err => {
        app.showError('فشل في النسخ');
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.getElementById('overlay');
    
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    overlay.classList.remove('show');
}

function showRegister() {
    app.showScreen('registerScreen');
}

function showLogin() {
    app.showScreen('loginScreen');
}

// دالة لفتح نوافذ التعليمات والشروط
function openHelpModal() {
    // سيتم تنفيذها لاحقاً
    app.showToast('معلومة', 'سيتم فتح نافذة التعليمات قريباً');
}

function openTermsModal() {
    // سيتم تنفيذها لاحقاً
    app.showToast('معلومة', 'سيتم فتح نافذة الشروط والأحكام قريباً');
}