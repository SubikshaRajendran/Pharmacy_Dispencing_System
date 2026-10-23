const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicineBatch' },
    transactionType: {
      type: String,
      enum: ['RECEIPT', 'DISPENSE', 'ADJUSTMENT', 'EXPIRED'],
      required: true
    },
    quantityChange: { type: Number, required: true }, // positive for receipt, negative for dispense/expired
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    actorId: { type: String, required: true },
    actorRole: { type: String, required: true },
    reason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
