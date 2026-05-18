const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['ANO', 'SUO', 'cadet'], // ERROR FIX #7 — cadet included
    default: 'cadet'
  },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }, // SUO accounts expire after 12 months
  profilePhoto: { type: String },
  accountStatus: {
    type:    String,
    enum:    ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DEACTIVATED'],
    default: function() {
      // ANO and SUO are approved by default (created by system/seed)
      // Cadets start as PENDING_APPROVAL
      return this.role === 'cadet' ? 'PENDING_APPROVAL' : 'APPROVED';
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null,
  },
  approvedAt: {
    type:    Date,
    default: null,
  },
  rejectionReason: {
    type:    String,
    default: null,
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
