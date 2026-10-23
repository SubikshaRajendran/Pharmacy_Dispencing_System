const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedData = require('./utils/seed');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (prescriptions)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database & Seed Initial Demo Data
connectDB().then(async () => {
  try {
    await seedData();
  } catch (err) {
    console.error('Initial seeding warning:', err.message);
  }
});

// Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'MediHeal Pharmacy API is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MediHeal Pharmacy Backend Server running on port ${PORT}`);
});
