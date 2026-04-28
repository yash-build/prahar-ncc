const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Contact your ANO.'
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    next(err);
  }
};

// Register — ERROR FIX #11: ANO accounts CANNOT be created via API
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, unitId } = req.body;

    // CRITICAL: Prevent ANO creation via API
    if (role === 'ANO') {
      return res.status(403).json({
        success: false,
        message: 'ANO accounts can only be created by the system owner via seed script.'
      });
    }

    // Only ANO can create SUO accounts
    if (role === 'SUO' && (!req.user || req.user.role !== 'ANO')) {
      return res.status(403).json({
        success: false,
        message: 'Only ANO can create SUO accounts.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    const expiresAt = role === 'SUO'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 12 months
      : null;

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'cadet',
      unit: unitId,
      expiresAt
    });

    // Audit log
    await AuditLog.create({
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user._id,
      performedBy: req.user?._id,
      details: { name, email, role }
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe };
