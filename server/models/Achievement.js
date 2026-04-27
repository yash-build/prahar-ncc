/**
 * Achievement Model
 *
 * Each document = one achievement for one cadet.
 * Examples: RDC, CATC, TSC, Republic Day Camp, etc.
 *
 * Linked to Cadet via cadetId.
 * On cadet detail page, all their achievements are fetched.
 */

const mongoose = require('mongoose');

const ACHIEVEMENT_LEVELS = [
  'School',
  'District',
  'State',
  'National',
  'International',
];

const ACHIEVEMENT_TYPES = [
  'Camp',        // CATC, RDC, Pre-RDC, TSC, etc.
  'Certificate', // A, B, C Certificate exam
  'Competition', // Sports, cultural
  'Award',       // Best Cadet, etc.
  'Other',
];

const achievementSchema = new mongoose.Schema({
  cadet: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Cadet',
    required: true,
    index:    true,
  },

  title: {
    type:      String,
    required:  [true, 'Achievement title is required'],
    trim:      true,
    maxlength: [120, 'Title too long'],
  },

  type: {
    type:    String,
    enum:    ACHIEVEMENT_TYPES,
    default: 'Camp',
  },

  level: {
    type: String,
    enum: ACHIEVEMENT_LEVELS,
  },

  // e.g., "Selected for Republic Day Camp 2024"
  description: {
    type:      String,
    maxlength: [400, 'Description too long'],
    default:   '',
  },

  // Date of the event/achievement
  date: {
    type:     Date,
    required: [true, 'Achievement date is required'],
  },

  // Optional: certificate image (Cloudinary URL)
  certificateUrl: {
    type:    String,
    default: '',
  },

  // Only ANO can add/edit achievements
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  },

}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
