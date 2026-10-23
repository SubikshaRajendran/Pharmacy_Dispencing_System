const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    items: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
        batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicineBatch' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true }
      }
    ],
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true }
    },
    orderStatus: {
      type: String,
      enum: ['Pending Verification', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Paid'
    },
    trackingReference: { type: String, default: '' },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: '' },
        updatedBy: { type: String, default: 'System' },
        updatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
