const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const StockTransaction = require('../models/StockTransaction');
const logAudit = require('../utils/auditLogger');

// @desc Admin Overview Dashboard Statistics
// @route GET /api/admin/stats
const getOverviewStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDoctors = await Doctor.countDocuments({ verificationStatus: 'verified', status: 'active' });
    const totalPharmacists = await User.countDocuments({ role: 'pharmacist' });
    const totalMedicines = await Medicine.countDocuments({ active: true });
    
    const pendingPrescriptions = await Prescription.countDocuments({
      status: { $in: ['Needs Review', 'Pending Verification', 'Processing'] }
    });

    const ordersCount = await Order.countDocuments();
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const dispatchedOrders = await Order.countDocuments({ orderStatus: 'Dispatched' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const lowStockMedicines = await Medicine.find({ totalStock: { $lt: 20 }, active: true }).select('name totalStock category price');
    const recentAuditLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(10);

    res.json({
      totalUsers,
      totalDoctors,
      totalPharmacists,
      totalMedicines,
      pendingPrescriptions,
      ordersCount,
      confirmedOrders,
      dispatchedOrders,
      deliveredOrders,
      lowStockMedicines,
      recentAuditLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all users (Admin)
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle User account status (Active / Inactive)
// @route PUT /api/admin/users/:id/status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'TOGGLE_USER_STATUS',
      targetType: 'User',
      targetId: user._id.toString(),
      changeSummary: `Changed status of user ${user.email} to ${user.status}`
    });

    res.json({ _id: user._id, status: user.status, message: `User status changed to ${user.status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all doctors (Admin)
// @route GET /api/admin/doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-password').sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Create Doctor Account
// @route POST /api/admin/doctors
const createDoctor = async (req, res) => {
  try {
    const { name, qualification, specialization, hospitalName, registrationNumber, doctorId, password } = req.body;

    const existingDoc = await Doctor.findOne({ doctorId: doctorId.toLowerCase().trim() });
    if (existingDoc) {
      return res.status(400).json({ message: `Doctor ID '${doctorId}' already exists` });
    }

    const doctor = await Doctor.create({
      doctorId: doctorId.toLowerCase().trim(),
      name,
      qualification: qualification || 'MBBS, MD',
      specialization: specialization || 'General Medicine',
      hospitalName: hospitalName || 'MediHeal Medical Center',
      registrationNumber,
      password: password || doctorId,
      verificationStatus: 'verified',
      status: 'active',
      requiresPasswordReset: true
    });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'CREATE_DOCTOR',
      targetType: 'Doctor',
      targetId: doctor._id.toString(),
      changeSummary: `Registered new verified doctor: ${doctor.name} (${doctor.doctorId})`
    });

    res.status(201).json({
      _id: doctor._id,
      doctorId: doctor.doctorId,
      name: doctor.name,
      registrationNumber: doctor.registrationNumber,
      verificationStatus: doctor.verificationStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Create Pharmacist Account
// @route POST /api/admin/pharmacist
const createPharmacist = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const pharmacist = await User.create({
      name,
      email,
      phone,
      password,
      role: 'pharmacist',
      status: 'active'
    });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'CREATE_PHARMACIST',
      targetType: 'User',
      targetId: pharmacist._id.toString(),
      changeSummary: `Created new Pharmacist account for ${pharmacist.email}`
    });

    res.status(201).json({
      _id: pharmacist._id,
      name: pharmacist.name,
      email: pharmacist.email,
      role: pharmacist.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Audit Logs (Admin)
// @route GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get notifications for logged in user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const targetUserId = req.user.role === 'doctor' ? req.user.doctorId : req.user._id.toString();
    const notifications = await Notification.find({
      userId: { $in: [targetUserId, 'all'] }
    }).sort({ createdAt: -1 }).limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.isRead = true;
      await notification.save();
    }
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOverviewStats,
  getUsers,
  toggleUserStatus,
  getDoctors,
  createDoctor,
  createPharmacist,
  getAuditLogs,
  getNotifications,
  markNotificationRead
};
