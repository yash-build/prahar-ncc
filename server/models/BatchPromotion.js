const mongoose = require('mongoose');

const batchPromotionSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  promotedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromBatchYear: { type: String, required: true },
  toBatchYear: { type: String, required: true },
  totalPromoted: { type: Number, default: 0 },
  totalPassedOut: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BatchPromotion', batchPromotionSchema);
