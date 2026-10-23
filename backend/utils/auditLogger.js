const AuditLog = require('../models/AuditLog');

const logAudit = async ({ actorId, actorRole, actorName = 'System', action, targetType = '', targetId = '', changeSummary, ipAddress = '127.0.0.1' }) => {
  try {
    await AuditLog.create({
      actorId,
      actorRole,
      actorName,
      action,
      targetType,
      targetId,
      changeSummary,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to record audit log:', error.message);
  }
};

module.exports = logAudit;
