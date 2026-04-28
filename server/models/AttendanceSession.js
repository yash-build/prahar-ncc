const mongoose = require('mongoose');

// ERROR FIX #10 — Date normalization helper
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const attendanceSessionSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  date: {
    type: Date,
    required: true,
    set: normalizeDate // Always normalize to midnight UTC on save
  },
  sessionType: {
    type: String,
    enum: ['PARADE', 'PT', 'NCC_DAY', 'CLASSIFIED', 'CAMP'],
    required: true
  },
  isMandatory: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date },
  totalPresent: { type: Number, default: 0 },
  totalAbsent: { type: Number, default: 0 },
  totalLeave: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

// Compound unique index — date + sessionType per unit
attendanceSessionSchema.index(
  { unitId: 1, date: 1, sessionType: 1 },
  { unique: true }
);

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
