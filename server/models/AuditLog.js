const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action:      { type: String, required: true },
  entityType:  { type: String },
  entityId:    { type: mongoose.Schema.Types.ObjectId },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details:     { type: mongoose.Schema.Types.Mixed },
  // UNDO system — store full before/after snapshots
  before:      { type: mongoose.Schema.Types.Mixed, default: null },
  after:       { type: mongoose.Schema.Types.Mixed, default: null },
  undone:      { type: Boolean, default: false },
  undoneAt:    { type: Date },
  undoneBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Severity tag for filtering
  severity:    { type: String, enum: ['INFO', 'WARN', 'CRITICAL'], default: 'INFO' },
  ip:          { type: String }
}, { timestamps: true });

// Auto-expire logs after 2 years
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
