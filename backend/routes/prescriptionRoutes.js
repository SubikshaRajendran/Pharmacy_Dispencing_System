const express = require('express');
const router = express.Router();
const {
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  getDoctorPrescriptions,
  getPendingPrescriptions,
  reviewPrescription
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('prescription'), uploadPrescription);
router.get('/my', protect, getUserPrescriptions);
router.get('/doctor', protect, authorize('doctor'), getDoctorPrescriptions);
router.get('/pending', protect, authorize('pharmacist', 'admin'), getPendingPrescriptions);
router.get('/:id', protect, getPrescriptionById);
router.put('/:id/review', protect, authorize('pharmacist', 'admin', 'doctor'), reviewPrescription);

module.exports = router;
