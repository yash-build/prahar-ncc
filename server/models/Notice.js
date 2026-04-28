const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  title: { type: String, required: true, maxlength: 100 },
  body: { type: String, required: true, maxlength: 800 },
  priority: {
    type: String,
    enum: ['URGENT', 'IMPORTANT', 'INFORMATION'],
    default: 'INFORMATION'
  },
  targetAudience: {
    type: String,
    enum: ['ALL', 'SD', 'SW'],
    default: 'ALL'
  },
  expiresAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  attachmentUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
