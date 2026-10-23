const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: String, required: true },
    actorRole: { type: String, required: true },
    actorName: { type: String, default: 'System' },
    action: { type: String, required: true },
    targetType: { type: String, default: '' },
    targetId: { type: String, default: '' },
    changeSummary: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
