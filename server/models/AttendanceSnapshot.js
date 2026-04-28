const mongoose = require('mongoose');

const attendanceSnapshotSchema = new mongoose.Schema({
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadet', required: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  month: { type: Number, required: true },  // 1-12
  year: { type: Number, required: true },
  totalSessions: { type: Number, default: 0 },
  present: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  leave: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 }
}, { timestamps: true });

attendanceSnapshotSchema.index({ cadetId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceSnapshot', attendanceSnapshotSchema);
