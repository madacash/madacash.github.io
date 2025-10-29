const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const transactionRoutes = require('./routes/transactions');
const rechargeRoutes = require('./routes/recharge');
const transferRoutes = require('./routes/transfer');
const pointsRoutes = require('./routes/points');
const notificationRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/terms.html'));
});

app.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/help.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Mada Cash Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
});