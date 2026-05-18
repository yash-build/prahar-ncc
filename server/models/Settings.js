const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true, unique: true },
  stats: {
    cadets: { type: String, default: '200+' },
    accuracy: { type: String, default: '98%' },
    wings: { type: String, default: '3' },
    uptime: { type: String, default: '24/7' },
    battalion: { type: String, default: '17 CG BN NCC' },
    college: { type: String, default: 'LCIT College, Bilaspur' }
  },
  visibility: {
    gallery: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
    yearbook: { type: Boolean, default: true },
    notices: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
