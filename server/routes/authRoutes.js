// ERROR FIX #1: Single router export
const router = require('express').Router();
const { login, register, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', protect, register);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

const requireRole = require('../middleware/requireRole');
const User = require('../models/User');

// Get all pending cadet accounts
router.get('/pending-accounts', protect, requireRole('ANO'), async (req, res, next) => {
  try {
    const pending = await User.find({
      role:          'cadet',
      accountStatus: 'PENDING_APPROVAL',
    })
    .select('name email createdAt')
    .lean();

    // Get cadet details for each pending user
    const Cadet = require('../models/Cadet');
    const enriched = await Promise.all(pending.map(async (user) => {
      const cadet = await Cadet.findOne({ authId: user._id })
        .select('serviceNumber wing rank yearOfStudy photoThumbUrl')
        .lean();
      return { ...user, cadet };
    }));

    res.json({ success: true, pendingAccounts: enriched, count: enriched.length });
  } catch (err) { next(err); }
});

// Approve a cadet account
router.put('/approve-account/:userId', protect, requireRole('ANO'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        accountStatus: 'APPROVED',
        approvedBy:    req.user._id,
        approvedAt:    new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Notify the cadet (in-app notification stored for when they login)
    const Cadet    = require('../models/Cadet');
    const Notification = require('../models/Notification');
    const cadet    = await Cadet.findOne({ authId: user._id });

    if (cadet) {
      await Notification.create({
        unitId: req.user.unit,
        userId: user._id,
        title:  'Account Approved!',
        body:   'Your NCC portal account has been approved by the ANO. You can now login.',
        type:   'SYSTEM',
        link:   '/portal',
      });
    }

    // Write to AuditLog
    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action:      'CADET_ACCOUNT_APPROVED',
      entityType:  'User',
      entityId:    user._id,
      performedBy: req.user._id,
      details:     { name: user.name, email: user.email },
    });

    res.json({ success: true, message: `${user.name}'s account approved.`, user });
  } catch (err) { next(err); }
});

// Reject a cadet account
router.put('/reject-account/:userId', protect, requireRole('ANO'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        accountStatus:   'REJECTED',
        rejectionReason: reason || 'Account request rejected by ANO.',
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: `${user.name}'s account rejected.` });
  } catch (err) { next(err); }
});

// Bulk approve multiple accounts
router.put('/bulk-approve', protect, requireRole('ANO'), async (req, res, next) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No user IDs provided.' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds }, role: 'cadet' },
      {
        accountStatus: 'APPROVED',
        approvedBy:    req.user._id,
        approvedAt:    new Date(),
      }
    );

    res.json({
      success:  true,
      approved: result.modifiedCount,
      message:  `${result.modifiedCount} accounts approved.`,
    });
  } catch (err) { next(err); }
});

module.exports = router;
