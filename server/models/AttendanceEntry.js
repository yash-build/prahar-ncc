const mongoose = require('mongoose');

const attendanceEntrySchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession',
    required: true
  },
  cadetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cadet',
    required: true
  },
  status: { type: String, enum: ['P', 'A', 'L'], required: true },
  leaveReason: {
    type: String,
    enum: ['MEDICAL', 'EXAM', 'PERSONAL', 'OTHER']
  }
}, { timestamps: true });

attendanceEntrySchema.index({ sessionId: 1, cadetId: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceEntry', attendanceEntrySchema);
