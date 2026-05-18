const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or deactivated.'
      });
    }

    if (user.role === 'cadet' && user.accountStatus === 'PENDING_APPROVAL') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending ANO approval. Please wait for confirmation.',
        accountStatus: 'PENDING_APPROVAL',
      });
    }

    if (user.role === 'cadet' && user.accountStatus === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: `Your account request was rejected. Reason: ${user.rejectionReason || 'Contact your ANO.'}`,
        accountStatus: 'REJECTED',
      });
    }

    if (user.role === 'cadet' && user.accountStatus === 'DEACTIVATED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact your ANO.',
        accountStatus: 'DEACTIVATED',
      });
    }

    // Check SUO expiry
    if (user.role === 'SUO' && user.expiresAt && new Date() > user.expiresAt) {
      return res.status(401).json({
        success: false,
        message: 'Your access has expired. Contact your ANO.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = { protect };
