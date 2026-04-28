const mongoose = require('mongoose');

const attendanceOverrideSchema = new mongoose.Schema({
  entryId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceEntry', required: true },
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadet', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  previousStatus: { type: String, enum: ['P', 'A', 'L'], required: true },
  newStatus: { type: String, enum: ['P', 'A', 'L'], required: true },
  reason: { type: String, required: true },
  overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceOverride', attendanceOverrideSchema);
