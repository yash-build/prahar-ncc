const YTConfig = require('../models/YTConfig');
const Cadet = require('../models/Cadet');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const AttendanceSession = require('../models/AttendanceSession');
const Notice = require('../models/Notice');
const Achievement = require('../models/Achievement');
const GalleryItem = require('../models/GalleryItem');
const Event = require('../models/Event');

// Get all section configs
const getAllConfig = async (req, res, next) => {
  try {
    const configs = await YTConfig.find({});
    res.json({ success: true, configs });
  } catch (err) { next(err); }
};

// Get one section config
const getSectionConfig = async (req, res, next) => {
  try {
    const config = await YTConfig.findOne({ section: req.params.section });
    res.json({ success: true, config: config || {} });
  } catch (err) { next(err); }
};

// Update section config (drag-drop, colors, fonts, text, images)
const updateSectionConfig = async (req, res, next) => {
  try {
    const config = await YTConfig.findOneAndUpdate(
      { section: req.params.section },
      {
        config: req.body.config,
        lastEditedBy: 'Yash Tiwari',
        version: req.body.version || 1
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, config });
  } catch (err) { next(err); }
};

// Reset section to default
const resetSection = async (req, res, next) => {
  try {
    await YTConfig.findOneAndDelete({ section: req.params.section });
    res.json({ success: true, message: `Section ${req.params.section} reset to default.` });
  } catch (err) { next(err); }
};

// Full system stats — only visible to YT
const getSystemStats = async (req, res, next) => {
  try {
    const [totalCadets, totalUsers, totalSessions, totalNotices] = await Promise.all([
      Cadet.countDocuments(),
      User.countDocuments(),
      AttendanceSession.countDocuments(),
      Notice.countDocuments()
    ]);
    res.json({
      success: true,
      stats: { totalCadets, totalUsers, totalSessions, totalNotices }
    });
  } catch (err) { next(err); }
};

// Full audit log access
const getAllLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ success: true, logs });
  } catch (err) { next(err); }
};

// Promote all batches
const promoteBatchAll = async (req, res, next) => {
  try {
    await Cadet.updateMany({ yearOfStudy: 2, status: 'ACTIVE' }, { yearOfStudy: 3 });
    await Cadet.updateMany({ yearOfStudy: 1, status: 'ACTIVE' }, { yearOfStudy: 2 });
    await Cadet.updateMany(
      { yearOfStudy: 3, status: 'ACTIVE' },
      { status: 'PASSED_OUT', passedOutAt: new Date() }
    );
    res.json({ success: true, message: 'All batches promoted successfully.' });
  } catch (err) { next(err); }
};

// Clear all cache (placeholder for Redis in future)
const clearCache = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Cache cleared. (No cache layer yet — ready for Redis)' });
  } catch (err) { next(err); }
};

// Export all data as JSON
const exportAllData = async (req, res, next) => {
  try {
    const cadets = await Cadet.find({}).lean();
    const users = await User.find({}).select('-password').lean();
    const logs = await AuditLog.find({}).lean();
    res.json({ success: true, data: { cadets, users, logs } });
  } catch (err) { next(err); }
};

// GET /api/yt/export
const exportSystemData = async (req, res, next) => {
  try {
    const data = {
      users: await User.find(),
      cadets: await Cadet.find(),
      attendance: await AttendanceSession.find(),
      notices: await Notice.find(),
      achievements: await Achievement.find(),
      gallery: await GalleryItem.find(),
      events: await Event.find(),
      config: await YTConfig.find()
    };

    res.json({ success: true, timestamp: new Date(), data });
  } catch (err) { next(err); }
};

module.exports = {
  getAllConfig,
  getSectionConfig,
  updateSectionConfig,
  resetSection,
  getSystemStats,
  getAllLogs,
  promoteBatchAll,
  clearCache,
  exportAllData,
  exportSystemData,
};
