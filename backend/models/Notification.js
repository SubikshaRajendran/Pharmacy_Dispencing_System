const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // User ObjectId or Doctor ID or 'all'
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'prescription', 'system'], default: 'system' },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
