const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Personal Care', 'Diabetic Care', 'Supplement', 'Devices', 'Baby Care', 'Hair Care', 'Prescription Drugs', 'General']
    },
    description: { type: String, default: '' },
    manufacturer: { type: String, default: 'MediHeal Pharma' },
    unit: { type: String, default: '25 pieces' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    totalStock: { type: Number, required: true, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    image: { type: String, default: '' },
    isPrescriptionRequired: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
