const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  imageUrl: { type: String, required: true },
  thumbUrl: { type: String },
  publicId: { type: String }, // Cloudinary public ID for deletion
  category: {
    type: String,
    enum: ['PARADE', 'CAMP', 'SPORTS', 'SOCIAL', 'AWARD', 'OTHER'],
    default: 'OTHER'
  },
  takenAt: { type: Date },
  showOnPublic: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
