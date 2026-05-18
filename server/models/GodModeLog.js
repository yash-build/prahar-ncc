/**
 * GodModeLog.js — God Mode action log (SEPARATE from AuditLog)
 * God Mode actions MUST NOT appear in /dashboard/audit (ANO-visible).
 * Only visible via /yt-command → Full Audit Log panel.
 */
const mongoose = require('mongoose');

const godModeLogSchema = new mongoose.Schema({
  action:      { type: String, required: true },
  entityType:  { type: String, default: 'System' },
  entityId:    { type: mongoose.Schema.Types.ObjectId, default: null },
  before:      { type: mongoose.Schema.Types.Mixed, default: null },
  after:       { type: mongoose.Schema.Types.Mixed, default: null },
  severity:    { type: String, enum: ['INFO', 'WARN', 'CRITICAL'], default: 'INFO' },
  undone:      { type: Boolean, default: false },
  undoneAt:    { type: Date },
  undoneBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

godModeLogSchema.index({ createdAt: -1 });
godModeLogSchema.index({ action: 1 });

module.exports = mongoose.model('GodModeLog', godModeLogSchema);
