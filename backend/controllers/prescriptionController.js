const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const { extractPrescriptionData } = require('../services/ocrService');
const { verifyPrescriptionDetails } = require('../services/prescriptionVerifier');
const logAudit = require('../utils/auditLogger');
const path = require('path');

// @desc Upload prescription & run automated OCR verification
// @route POST /api/prescriptions/upload
const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a prescription image or PDF file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fullPath = path.join(__dirname, '../uploads', req.file.filename);

    // 1. Run OCR extraction
    const ocrData = await extractPrescriptionData(fullPath);

    // 2. Run Verification Engine against DB doctors & inventory
    const verification = await verifyPrescriptionDetails(ocrData);

    // 3. Save Prescription Document
    const prescription = await Prescription.create({
      userId: req.user._id,
      doctorId: verification.doctorId,
      doctorName: verification.doctorName,
      patientName: ocrData.patientName || req.user.name,
      prescriptionDate: ocrData.prescriptionDate,
      originalFileUrl: fileUrl,
      extractedText: ocrData.rawText,
      medicines: verification.structuredMedicines,
      status: verification.status,
      verificationFlags: verification.flags,
      reviewNotes: verification.flags.length > 0 ? verification.flags.join('; ') : 'Passed automated doctor verification',
      verifiedBy: verification.status === 'Verified' ? 'System OCR Engine' : ''
    });

    // 4. Create Notification for User
    await Notification.create({
      userId: req.user._id.toString(),
      title: `Prescription ${prescription.status}`,
      message: verification.status === 'Verified'
        ? `Your prescription from Doctor ${verification.doctorName} was verified successfully. You can now proceed to buy.`
        : `Your prescription requires pharmacist review: ${verification.flags.join(', ')}`,
      type: 'prescription',
      link: `/prescriptions/${prescription._id}`
    });

    // 5. Audit Log Entry
    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'UPLOAD_PRESCRIPTION',
      targetType: 'Prescription',
      targetId: prescription._id.toString(),
      changeSummary: `Uploaded prescription document. Verification status: ${verification.status}`
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user prescriptions
// @route GET /api/prescriptions/my
const getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get prescription by ID
// @route GET /api/prescriptions/:id
const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('medicines.matchedMedicineId');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get prescriptions for logged in Doctor
// @route GET /api/prescriptions/doctor
const getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user.doctorId.toLowerCase() })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get pending/flagged prescriptions for Pharmacist/Admin review
// @route GET /api/prescriptions/pending
const getPendingPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      status: { $in: ['Needs Review', 'Pending Verification', 'Processing'] }
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Review (Approve or Reject) prescription manually
// @route PUT /api/prescriptions/:id/review
const reviewPrescription = async (req, res) => {
  try {
    const { status, reviewNotes, rejectionReason } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.status = status;
    prescription.reviewNotes = reviewNotes || prescription.reviewNotes;
    if (rejectionReason) prescription.rejectionReason = rejectionReason;
    prescription.verifiedBy = `${req.user.name} (${req.user.role})`;
    await prescription.save();

    // Create Notification for Patient
    await Notification.create({
      userId: prescription.userId.toString(),
      title: `Prescription ${status}`,
      message: status === 'Verified'
        ? 'Your prescription has been approved by our pharmacist. You can now proceed to order.'
        : `Your prescription was rejected: ${rejectionReason || 'Please upload a clear medical document.'}`,
      type: 'prescription',
      link: `/prescriptions/${prescription._id}`
    });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      actorName: req.user.name,
      action: 'REVIEW_PRESCRIPTION',
      targetType: 'Prescription',
      targetId: prescription._id.toString(),
      changeSummary: `Manually updated prescription status to ${status}`
    });

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  getDoctorPrescriptions,
  getPendingPrescriptions,
  reviewPrescription
};
