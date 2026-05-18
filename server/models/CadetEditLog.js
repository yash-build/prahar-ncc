const mongoose = require('mongoose');

const cadetEditLogSchema = new mongoose.Schema({
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadet', required: true },
  fieldName: { type: String, required: true },
  oldValue: { type: String },
  newValue: { type: String },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('CadetEditLog', cadetEditLogSchema);
