const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, maxlength: 1000 },
  type: {
    type: String,
    enum: ['PARADE', 'CAMP', 'COMPETITION', 'SOCIAL_SERVICE', 'TRAINING', 'OTHER'],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  venue: { type: String },
  isCompulsory: { type: Boolean, default: false },
  targetWing: { type: String, enum: ['ALL', 'SD', 'SW'], default: 'ALL' },
  status: {
    type: String,
    enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'UPCOMING'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
