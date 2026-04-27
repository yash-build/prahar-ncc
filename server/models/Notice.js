/**
 * Notice Model
 *
 * Notices replace WhatsApp group announcements.
 * Key features:
 * - Priority system (urgent/normal/info)
 * - Expiry date — auto-hidden after expiry
 * - Target audience (SD/SW/ALL)
 */

const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type:      String,
    required:  [true, 'Notice title is required'],
    trim:      true,
    maxlength: [120, 'Title too long'],
  },

  content: {
    type:      String,
    required:  [true, 'Notice content is required'],
    maxlength: [2000, 'Content too long'],
  },

  priority: {
    type:    String,
    enum:    ['urgent', 'normal', 'info'],
    default: 'normal',
  },

  // Who this notice targets
  targetWing: {
    type:    String,
    enum:    ['SD', 'SW', 'ALL'],
    default: 'ALL',
  },

  // After this date, notice is hidden from cadets automatically
  expiresAt: {
    type:    Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
  },

  // Is it pinned to top regardless of date
  isPinned: {
    type:    Boolean,
    default: false,
  },

  createdBy: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },

}, { timestamps: true });

// ── Index for efficient active-notices queries ────────────────────────────────
noticeSchema.index({ expiresAt: 1, priority: -1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
