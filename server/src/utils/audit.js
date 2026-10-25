const AuditLog = require('../models/AuditLog');

const logAudit = async ({ actor, action, resourceType, resourceId, metadata = {}, ipAddress = '' }) => {
  try {
    await AuditLog.create({
      actor,
      action,
      resourceType,
      resourceId: String(resourceId),
      metadata,
      ipAddress,
    });
  } catch (err) {
    console.error('[Audit Log] Failed to record audit log:', err.message);
  }
};

module.exports = { logAudit };
