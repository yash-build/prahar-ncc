const mongoose = require('mongoose');

const ytConfigSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  section: { type: String, required: true }, // 'hero', 'ano', 'yearbook', etc.
  config: { type: mongoose.Schema.Types.Mixed }, // Free-form JSON customization
  lastEditedBy: { type: String, default: 'Yash Tiwari' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

ytConfigSchema.index({ section: 1 }, { unique: true });

module.exports = mongoose.model('YTConfig', ytConfigSchema);
