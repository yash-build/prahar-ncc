const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },          // '17 CG BN NCC'
  collegeName: { type: String, required: true },   // 'LCIT College'
  city: { type: String, required: true },
  state: { type: String, required: true },
  nccGroup: { type: String },
  slug: { type: String, unique: true, required: true },
  motto: { type: String },
  logoUrl: { type: String },
  coverUrl: { type: String },
  isPublic: { type: Boolean, default: true },
  currentBatchYear: { type: String, default: '2024-25' }
}, { timestamps: true });

module.exports = mongoose.model('Unit', unitSchema);
