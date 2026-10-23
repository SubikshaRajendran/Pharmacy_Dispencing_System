const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getUsers,
  toggleUserStatus,
  getDoctors,
  createDoctor,
  createPharmacist,
  getAuditLogs,
  getNotifications,
  markNotificationRead
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin', 'pharmacist'), getOverviewStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);
router.get('/doctors', protect, authorize('admin', 'pharmacist'), getDoctors);
router.post('/doctors', protect, authorize('admin'), createDoctor);
router.post('/pharmacist', protect, authorize('admin'), createPharmacist);
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
