-- إنشاء جداول قاعدة البيانات

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT,
    phone TEXT UNIQUE NOT NULL,
    unique_code TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    gift_points INTEGER DEFAULT 0,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    bank_account_number TEXT,
    bank_type TEXT
);

-- جدول الباقات
CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration TEXT,
    price DECIMAL(10,2),
    data_amount TEXT,
    card_number TEXT,
    used BOOLEAN DEFAULT 0,
    customer_id TEXT,
    used_at DATETIME,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- جدول العمليات
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2),
    balance_before DECIMAL(10,2),
    balance_after DECIMAL(10,2),
    card_number TEXT,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- جدول بطاقات الشحن
CREATE TABLE IF NOT EXISTS recharge_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    used BOOLEAN DEFAULT 0,
    customer_id TEXT,
    used_at DATETIME,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- جدول التنبيهات
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- جدول نقاط الهدايا
CREATE TABLE IF NOT EXISTS gift_points (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    points INTEGER NOT NULL,
    balance_before INTEGER,
    balance_after INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- جدول بطاقات العملاء
CREATE TABLE IF NOT EXISTS customer_cards (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    duration TEXT,
    price DECIMAL(10,2),
    data_amount TEXT,
    card_number TEXT NOT NULL,
    acquisition_type TEXT NOT NULL,
    acquisition_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'نشط',
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- جدول المستفيدين المفضلين
CREATE TABLE IF NOT EXISTS favorite_recipients (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    recipient_code TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    UNIQUE(customer_id, recipient_code)
);

-- إدخال بيانات الباقات الافتراضية
INSERT OR IGNORE INTO packages (id, name, duration, price, data_amount, card_number, used) VALUES
('pkg-1', 'باقة يوم', 'يوم واحد', 200, '1 جيجا', 'DAY001', 0),
('pkg-2', 'باقة يوم', 'يوم واحد', 200, '1 جيجا', 'DAY002', 0),
('pkg-3', 'باقة أسبوع', 'أسبوع', 500, '5 جيجا', 'WEEK001', 0),
('pkg-4', 'باقة أسبوع', 'أسبوع', 500, '5 جيجا', 'WEEK002', 0),
('pkg-5', 'باقة أسبوعين', 'أسبوعين', 1500, '15 جيجا', 'TWOWEEK001', 0),
('pkg-6', 'باقة أسبوعين', 'أسبوعين', 1500, '15 جيجا', 'TWOWEEK002', 0),
('pkg-7', 'باقة شهر', 'شهر', 2500, '30 جيجا', 'MONTH001', 0),
('pkg-8', 'باقة شهر', 'شهر', 2500, '30 جيجا', 'MONTH002', 0);

-- إدخال بطاقات شحن افتراضية
INSERT OR IGNORE INTO recharge_cards (card_number, amount, used) VALUES
('RCH6000001', 6000, 0),
('RCH6000002', 6000, 0),
('RCH12000001', 12000, 0),
('RCH12000002', 12000, 0);