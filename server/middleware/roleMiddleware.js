/**
 * Role Middleware
 *
 * Usage:
 *   router.delete('/cadet/:id', protect, requireRole('ANO'), deleteCadet)
 *
 * Why separate from authMiddleware?
 * Some routes need auth but not role restriction.
 * This keeps responsibilities clean.
 */

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — requires role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
