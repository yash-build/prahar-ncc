/**
 * Cadet Model
 * Core entity. Every cadet in the NCC unit has one document.
 *
 * Key Design Decisions:
 * - Wing (SD/SW) is stored per cadet, not inferred from name
 * - Rank follows official NCC progression
 * - Photo stored as Cloudinary URL string
 * - isHonored flag for Honor Board — toggled by ANO only
 * - personalMessage from ANO (visible on cadet's profile page)
 */

const mongoose = require('mongoose');

const RANKS = ['Cadet', 'L/Cpl', 'Cpl', 'Sgt', 'JUO', 'SUO'];
const WINGS = ['SD', 'SW']; // Senior Division (Boys), Senior Wing (Girls)
const YEARS = [1, 2, 3];   // Year of enrollment in NCC

const cadetSchema = new mongoose.Schema({
  // ── Identity ─────────────────────────────────────────────────────────────
  name: {
    type:     String,
    required: [true, 'Cadet name is required'],
    trim:     true,
    maxlength: [80, 'Name too long'],
  },

  regNo: {
    type:   String,
    unique: true,
    required: [true, 'Registration number is required'],
    trim: true,
    uppercase: true,
  },

  wing: {
    type:     String,
    required: true,
    enum:     { values: WINGS, message: 'Wing must be SD or SW' },
  },

  rank: {
    type:    String,
    default: 'Cadet',
    enum:    { values: RANKS, message: 'Invalid NCC rank' },
  },

  year: {
    type:     Number,
    required: true,
    enum:     { values: YEARS, message: 'Year must be 1, 2, or 3' },
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  phone: {
    type:  String,
    trim:  true,
    match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
  },

  email: {
    type:  String,
    trim:  true,
    lowercase: true,
  },

  // ── Photo ─────────────────────────────────────────────────────────────────
  photoUrl: {
    type:    String,
    default: '', // Empty = show default avatar in frontend
  },

  photoPublicId: {
    type:    String,
    default: '', // Cloudinary public ID for deletion
  },

  // ── Honor System ──────────────────────────────────────────────────────────
  isHonored: {
    type:    Boolean,
    default: false,
  },

  honorNote: {
    type:      String,
    default:   '',
    maxlength: [200, 'Honor note too long'],
  },

  // ── Personal Message from ANO ─────────────────────────────────────────────
  // Visible only on this cadet's detail page
  personalMessage: {
    type:      String,
    default:   '',
    maxlength: [500, 'Message too long — keep it under 500 characters'],
  },

  // ── Status ────────────────────────────────────────────────────────────────
  isActive: {
    type:    Boolean,
    default: true, // Inactive = passed out / left unit
  },

  // Tracks when this cadet was enrolled in the system
  // Used for attendance calculations (cadets added mid-semester)
  enrolledAt: {
    type:    Date,
    default: Date.now,
  },

}, { timestamps: true });

// ── Indexes for fast filtering ─────────────────────────────────────────────
cadetSchema.index({ wing: 1, rank: 1, year: 1 });
cadetSchema.index({ regNo: 1 });
cadetSchema.index({ isHonored: 1 });

module.exports = mongoose.model('Cadet', cadetSchema);
