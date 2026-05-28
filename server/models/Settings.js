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
  },
  // ANO Profile (displayed on public landing page)
  anoProfile: {
    photo: { type: String, default: '' },
    name: { type: String, default: '' },
    title: { type: String, default: 'LT. / CAPT.' },
    designation: { type: String, default: 'Associate NCC Officer' },
    quote: { type: String, default: '"Discipline is the soul of an army. It makes small numbers formidable; procures success to the weak, and esteem to all."' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
