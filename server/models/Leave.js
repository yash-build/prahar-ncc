const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadet', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true, maxlength: 1000 },
  attachment: {
    url: { type: String },
    publicId: { type: String },
    resourceType: { type: String }
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  remarks: { type: String, maxlength: 500 }, // Feedback from ANO/SUO
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

// Ensure a cadet can quickly find their leave history
leaveSchema.index({ cadetId: 1, createdAt: -1 });
// Ensure SUO/ANO can quickly find pending leaves for their unit
leaveSchema.index({ unitId: 1, status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
