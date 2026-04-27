/**
 * Auth Controller
 * Handles user login and registration (ANO creates SUO accounts)
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate JWT ───────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ── @route   POST /api/auth/login ─────────────────────────────────────────
// ── @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Fetch user WITH password (select: false by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id:             user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        linkedCadetId:  user.linkedCadetId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/auth/register ──────────────────────────────────────
// ── @access  Private (ANO only) — ANO creates new accounts
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, linkedCadetId } = req.body;

    // Only ANO can create SUO accounts
    if (req.user.role !== 'ANO' && role === 'ANO') {
      return res.status(403).json({ success: false, message: 'Only ANO can create ANO accounts' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role:          role || 'SUO',
      linkedCadetId: linkedCadetId || null,
    });

    res.status(201).json({
      success: true,
      message: `${role || 'SUO'} account created successfully`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/auth/me ─────────────────────────────────────────────
// ── @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── @route   GET /api/auth/users ─────────────────────────────────────────
// ── @access  Private (ANO only)
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/auth/users/:id/toggle ─────────────────────────────
// ── @access  Private (ANO only) — deactivate a user
const toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe, listUsers, toggleUser };
