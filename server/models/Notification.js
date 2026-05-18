const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cadet' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String },
  link: { type: String },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
