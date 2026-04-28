const mongoose = require('mongoose');

const cadetSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceNumber: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  wing: { type: String, enum: ['SD', 'SW'], required: true },
  rank: {
    type: String,
    enum: ['CADET', 'LCPL', 'CPL', 'SGT', 'JUO', 'SUO'],
    default: 'CADET'
  },
  yearOfStudy: { type: Number, enum: [1, 2, 3], required: true },
  batchYear: { type: String, required: true },
  enrollmentDate: { type: Date, required: true, default: Date.now },
  status: {
    type: String,
    enum: ['ACTIVE', 'ON_LEAVE', 'DETACHED', 'PASSED_OUT'],
    default: 'ACTIVE'
  },
  photoUrl: { type: String },
  photoThumbUrl: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  yearbookMessage: { type: String, maxlength: 160 },
  commandantsNote: { type: String, maxlength: 280 },
  noteIsPublic: { type: Boolean, default: false },
  showOnPublic: { type: Boolean, default: true },
  isDefaulter: { type: Boolean, default: false },
  isHonorRoll: { type: Boolean, default: false },
  honorRollYear: { type: String },
  isSUOPosition: { type: Boolean, default: false },
  isJUOPosition: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  passedOutAt: { type: Date }
}, { timestamps: true });

// Compound unique index
cadetSchema.index({ unitId: 1, serviceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Cadet', cadetSchema);
