const mongoose = require('mongoose');

const medicineBatchSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    batchNumber: { type: String, required: true, trim: true },
    quantityReceived: { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    supplier: { type: String, default: 'MediHeal Wholesale Supply' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicineBatch', medicineBatchSchema);
