const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  loginDoctor, 
  changeDoctorPassword, 
  getMe, 
  updateDeliveryAddress, 
  updateProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/doctor-login', loginDoctor);
router.post('/doctor-change-password', protect, changeDoctorPassword);
router.get('/me', protect, getMe);
router.put('/address', protect, updateDeliveryAddress);
router.put('/profile', protect, updateProfile);

module.exports = router;
