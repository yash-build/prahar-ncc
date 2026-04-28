const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadet', required: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  type: {
    type: String,
    enum: ['A_CERTIFICATE', 'B_CERTIFICATE', 'C_CERTIFICATE', 'PARTICIPATION', 'ACHIEVEMENT', 'OTHER'],
    required: true
  },
  title: { type: String, required: true },
  issueDate: { type: Date, required: true },
  issuedBy: { type: String },
  fileUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
