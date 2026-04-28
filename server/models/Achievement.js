const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadet', required: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  type: {
    type: String,
    enum: ['CAMP', 'COMPETITION', 'COURSE', 'SOCIAL_SERVICE', 'AWARD'],
    required: true
  },
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ['UNIT', 'DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL'],
    required: true
  },
  result: { type: String, required: true },
  date: { type: Date, required: true },
  certificateUrl: { type: String },
  showOnPublic: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['SUGGESTED', 'APPROVED', 'REJECTED'],
    default: 'APPROVED'
  },
  suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
