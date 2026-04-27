/**
 * AttendanceSession Model
 *
 * Design:
 * One document = one parade/session on one date
 *
 * Each session has an array of attendance records (cadet + status).
 * This makes monthly aggregation simple:
 *   → Filter sessions by date range
 *   → Sum "present" for each cadetId
 *   → Divide by total sessions = attendance %
 *
 * Why NOT one document per cadet?
 * Because querying "who was present on March 15" requires
 * a single document scan, not scanning all cadets.
 */

const mongoose = require('mongoose');

// Individual cadet record within a session
const attendanceRecordSchema = new mongoose.Schema({
  cadet: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Cadet',
    required: true,
  },
  status: {
    type:    String,
    enum:    ['present', 'absent', 'excused'],
    default: 'absent',
  },
  // Optional remark per cadet (e.g., "medical leave")
  remark: {
    type:      String,
    maxlength: 100,
    default:   '',
  },
}, { _id: false }); // No sub-document ID needed


const attendanceSessionSchema = new mongoose.Schema({
  date: {
    type:     Date,
    required: [true, 'Session date is required'],
  },

  // Label like "Morning Parade" / "NCC Day Practice" / "Sunday Camp"
  sessionLabel: {
    type:    String,
    default: 'Parade',
    maxlength: 80,
  },

  // Which wing this session applies to
  // 'ALL' = both SD and SW attend together
  wing: {
    type:    String,
    enum:    ['SD', 'SW', 'ALL'],
    default: 'ALL',
  },

  records: [attendanceRecordSchema],

  // Who marked this attendance
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  },

  // ANO can lock a session to prevent further edits
  isLocked: {
    type:    Boolean,
    default: false,
  },

  // Last edit timestamp (for audit trail)
  lastEditedAt: {
    type: Date,
  },

  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  },

}, { timestamps: true });

// ── Prevent duplicate sessions on same date + wing ────────────────────────────
attendanceSessionSchema.index({ date: 1, wing: 1 }, { unique: true });

// ── Index for fast monthly aggregation ───────────────────────────────────────
attendanceSessionSchema.index({ date: -1 });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
