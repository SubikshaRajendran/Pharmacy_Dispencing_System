const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  getDoctorOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my', protect, getUserOrders);
router.get('/doctor', protect, authorize('doctor'), getDoctorOrders);
router.get('/all', protect, authorize('pharmacist', 'admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('pharmacist', 'admin'), updateOrderStatus);

module.exports = router;
