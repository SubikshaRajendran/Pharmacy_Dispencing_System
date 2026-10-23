const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    patientName: { type: String, default: '' },
    prescriptionDate: { type: Date },
    originalFileUrl: { type: String, required: true },
    extractedText: { type: String, default: '' },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        duration: { type: String, default: '' },
        quantity: { type: Number, default: 1 },
        matchedMedicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        price: { type: Number, default: 0 },
        inStock: { type: Boolean, default: true }
      }
    ],
    status: {
      type: String,
      enum: ['Processing', 'Pending Verification', 'Verified', 'Needs Review', 'Rejected'],
      default: 'Processing'
    },
    verificationFlags: [{ type: String }],
    reviewNotes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    verifiedBy: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
