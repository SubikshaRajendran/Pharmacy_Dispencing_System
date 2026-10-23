const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');
const MedicineBatch = require('../models/MedicineBatch');
const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const StockTransaction = require('../models/StockTransaction');

const seedData = async () => {
  try {
    console.log('--- Initializing MediHeal System Database & Demo Accounts ---');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Medicine.deleteMany({});
    await MedicineBatch.deleteMany({});
    await Prescription.deleteMany({});
    await Order.deleteMany({});
    await AuditLog.deleteMany({});
    await Notification.deleteMany({});
    await StockTransaction.deleteMany({});

    // 1. Create Predefined Authorized Staff & User Accounts
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@mediheal.com',
      phone: '+1 800 555 0199',
      password: 'Admin@123',
      role: 'admin',
      status: 'active'
    });

    const pharmacistUser = await User.create({
      name: 'Marcus Brody (RPh)',
      email: 'pharmacist@mediheal.com',
      phone: '+1 800 555 0144',
      password: 'Pharm@123',
      role: 'pharmacist',
      status: 'active'
    });

    const demoUser = await User.create({
      name: 'Ravi Kumar',
      email: 'user@mediheal.com',
      phone: '+1 555 019 2834',
      password: 'User@123',
      role: 'user',
      status: 'active',
      addresses: []
    });

    // 2. Create Predefined Doctor Accounts (doc123, doc476, doc101, doc102)
    const doctor123 = await Doctor.create({
      doctorId: 'doc123',
      name: 'Dr. Alexander Hayes',
      qualification: 'MBBS, MD (Internal Medicine)',
      specialization: 'Internal Medicine & General Practice',
      hospitalName: 'MediHeal Medical Center',
      registrationNumber: 'MED-REG-12345',
      password: 'doc123',
      verificationStatus: 'verified',
      status: 'active',
      requiresPasswordReset: true
    });

    await Doctor.create({
      doctorId: 'doc476',
      name: 'Dr. Elena Rostova',
      qualification: 'MBBS, MS (Endocrinology)',
      specialization: 'Endocrinology & Diabetic Care',
      hospitalName: 'Metro Healthcare Center',
      registrationNumber: 'MED-REG-47689',
      password: 'doc476',
      verificationStatus: 'verified',
      status: 'active',
      requiresPasswordReset: true
    });

    await Doctor.create({
      doctorId: 'doc101',
      name: 'Dr. Sarah Jenkins',
      qualification: 'MBBS, MD (Cardiology)',
      specialization: 'Cardiology & General Medicine',
      hospitalName: 'MediHeal Medical Center',
      registrationNumber: 'MED-REG-89210',
      password: 'doc101',
      verificationStatus: 'verified',
      status: 'active',
      requiresPasswordReset: true
    });

    await Doctor.create({
      doctorId: 'doc102',
      name: 'Dr. Robert Vance',
      qualification: 'MBBS, MS (Orthopedics)',
      specialization: 'Orthopedics & Joint Care',
      hospitalName: 'City General Hospital',
      registrationNumber: 'MED-REG-44392',
      password: 'doc102',
      verificationStatus: 'verified',
      status: 'active',
      requiresPasswordReset: true
    });

    // 3. Seed Standard Prescribed Medicines for Catalog Matching & Dispensing
    const standardMedicines = [
      {
        name: 'Paracetamol 500 mg',
        category: 'Prescription Drugs',
        description: 'Pain reliever and fever reducer for acute symptoms.',
        manufacturer: 'MediHeal Pharma',
        unit: '10 tablets',
        price: 5.00,
        totalStock: 100,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
        isPrescriptionRequired: true
      },
      {
        name: 'Amoxicillin 500 mg',
        category: 'Prescription Drugs',
        description: 'Broad-spectrum antibiotic capsule for bacterial infections.',
        manufacturer: 'ClariCare Labs',
        unit: '15 capsules',
        price: 12.00,
        totalStock: 100,
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
        isPrescriptionRequired: true
      },
      {
        name: 'Cetirizine 10 mg',
        category: 'Prescription Drugs',
        description: 'Non-drowsy antihistamine for allergy relief.',
        manufacturer: 'BioVita Nutrition',
        unit: '5 tablets',
        price: 8.00,
        totalStock: 100,
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=60',
        isPrescriptionRequired: true
      }
    ];

    const createdMedicines = await Medicine.insertMany(standardMedicines);

    // Create Batches for each medicine (FEFO tracking)
    for (const med of createdMedicines) {
      const batch1 = await MedicineBatch.create({
        medicineId: med._id,
        batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        quantityReceived: med.totalStock,
        remainingQuantity: med.totalStock,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        costPrice: Number((med.price * 0.6).toFixed(2)),
        sellingPrice: med.price,
        supplier: 'MediHeal Wholesale Supply Corp'
      });

      // Record Stock Transaction
      await StockTransaction.create({
        medicineId: med._id,
        batchId: batch1._id,
        transactionType: 'RECEIPT',
        quantityChange: med.totalStock,
        actorId: adminUser._id.toString(),
        actorRole: 'admin',
        reason: 'Initial Inventory Stock Import'
      });
    }

    // 4. Log Initial System Audit Record
    await AuditLog.create({
      actorId: adminUser._id.toString(),
      actorRole: 'admin',
      actorName: adminUser.name,
      action: 'SYSTEM_INITIALIZATION',
      targetType: 'System',
      targetId: 'ALL',
      changeSummary: 'Initialized system roles, verified doctor registries (doc123, doc476, doc101, doc102), and active medicine inventory.',
      ipAddress: '127.0.0.1'
    });

    console.log('--- MediHeal System Seed Data Initialized Successfully! ---');
  } catch (error) {
    console.error('Database Initialization Warning:', error.message);
  }
};

module.exports = seedData;
