const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ unitId: req.user.unit }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ unitId: req.user.unit, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};
