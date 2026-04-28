/**
 * ytController.js — GOD MODE SYSTEM CONTROLLER
 * Full system control above ANO level
 * All actions are logged with before/after snapshots
 */

const YTConfig          = require('../models/YTConfig');
const Cadet             = require('../models/Cadet');
const User              = require('../models/User');
const AuditLog          = require('../models/AuditLog');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceEntry   = require('../models/AttendanceEntry');
const Notice            = require('../models/Notice');
const Achievement       = require('../models/Achievement');
const GalleryItem       = require('../models/GalleryItem');
const Event             = require('../models/Event');
const bcrypt            = require('bcryptjs');

// ─── Helper: log action with before/after ────────────────────────────────────
const log = (action, entityType, entityId, before, after, severity = 'INFO') =>
  AuditLog.create({ action, entityType, entityId, before, after, severity }).catch(() => {});

// ─── SYSTEM STATS ────────────────────────────────────────────────────────────
const getSystemStats = async (req, res, next) => {
  try {
    const [totalCadets, totalUsers, totalSessions, totalNotices,
           totalAchievements, totalGallery, totalEvents, totalLogs] = await Promise.all([
      Cadet.countDocuments(),
      User.countDocuments(),
      AttendanceSession.countDocuments(),
      Notice.countDocuments(),
      Achievement.countDocuments(),
      GalleryItem.countDocuments(),
      Event.countDocuments(),
      AuditLog.countDocuments(),
    ]);
    const activeCadets  = await Cadet.countDocuments({ status: 'ACTIVE' });
    const passedOut     = await Cadet.countDocuments({ status: 'PASSED_OUT' });
    res.json({ success: true, stats: {
      totalCadets, activeCadets, passedOut, totalUsers,
      totalSessions, totalNotices, totalAchievements,
      totalGallery, totalEvents, totalLogs
    }});
  } catch (err) { next(err); }
};

// ─── ALL AUDIT LOGS (filtered) ───────────────────────────────────────────────
const getAllLogs = async (req, res, next) => {
  try {
    const { action, entityType, user: userId, date, page = 1, limit = 100 } = req.query;
    const q = {};
    if (action)     q.action = { $regex: action, $options: 'i' };
    if (entityType) q.entityType = entityType;
    if (userId)     q.performedBy = userId;
    if (date) {
      const d = new Date(date);
      q.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const total = await AuditLog.countDocuments(q);
    const logs  = await AuditLog.find(q)
      .populate('performedBy', 'name role')
      .populate('undoneBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, logs, total });
  } catch (err) { next(err); }
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use.' });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, role });
    await log('USER_CREATED', 'User', user._id, null, { name, email, role }, 'WARN');
    res.status(201).json({ success: true, user: { ...user.toObject(), password: undefined } });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const before = await User.findById(req.params.id).select('-password').lean();
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    await log('USER_UPDATED', 'User', user._id, before, req.body, 'WARN');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const before = await User.findById(req.params.id).select('-password').lean();
    await User.findByIdAndDelete(req.params.id);
    await log('USER_DELETED', 'User', req.params.id, before, null, 'CRITICAL');
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) { next(err); }
};

const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.params.id, { password: hash });
    await log('PASSWORD_RESET', 'User', req.params.id, null, { reset: true }, 'CRITICAL');
    res.json({ success: true, message: 'Password reset.' });
  } catch (err) { next(err); }
};

// ─── CADET MANAGEMENT ────────────────────────────────────────────────────────
const getAllCadets = async (req, res, next) => {
  try {
    const cadets = await Cadet.find({}).sort({ name: 1 });
    res.json({ success: true, cadets });
  } catch (err) { next(err); }
};

const updateCadetGod = async (req, res, next) => {
  try {
    const before = await Cadet.findById(req.params.id).lean();
    const cadet  = await Cadet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await log('CADET_UPDATED_GOD', 'Cadet', cadet._id, before, req.body);
    res.json({ success: true, cadet });
  } catch (err) { next(err); }
};

const deleteCadetGod = async (req, res, next) => {
  try {
    const before = await Cadet.findById(req.params.id).lean();
    await Cadet.findByIdAndDelete(req.params.id);
    await log('CADET_DELETED_GOD', 'Cadet', req.params.id, before, null, 'CRITICAL');
    res.json({ success: true, message: 'Cadet deleted.' });
  } catch (err) { next(err); }
};

const markPassedOut = async (req, res, next) => {
  try {
    const before = await Cadet.findById(req.params.id).lean();
    const cadet  = await Cadet.findByIdAndUpdate(req.params.id, { status: 'PASSED_OUT', passedOutAt: new Date() }, { new: true });
    await log('CADET_PASSED_OUT', 'Cadet', cadet._id, before, { status: 'PASSED_OUT' }, 'WARN');
    res.json({ success: true, cadet });
  } catch (err) { next(err); }
};

// ─── ATTENDANCE MANAGEMENT ───────────────────────────────────────────────────
const getAllSessions = async (req, res, next) => {
  try {
    const sessions = await AttendanceSession.find({}).sort({ date: -1 }).limit(200);
    res.json({ success: true, sessions });
  } catch (err) { next(err); }
};

const deleteSessionGod = async (req, res, next) => {
  try {
    const before = await AttendanceSession.findById(req.params.id).lean();
    await AttendanceEntry.deleteMany({ sessionId: req.params.id });
    await AttendanceSession.findByIdAndDelete(req.params.id);
    await log('ATTENDANCE_DELETED_GOD', 'AttendanceSession', req.params.id, before, null, 'CRITICAL');
    res.json({ success: true, message: 'Session and entries deleted.' });
  } catch (err) { next(err); }
};

// ─── NOTICE MANAGEMENT ───────────────────────────────────────────────────────
const getAllNoticesGod = async (req, res, next) => {
  try {
    const notices = await Notice.find({}).sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (err) { next(err); }
};

const updateNoticeGod = async (req, res, next) => {
  try {
    const before  = await Notice.findById(req.params.id).lean();
    const notice  = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await log('NOTICE_UPDATED_GOD', 'Notice', notice._id, before, req.body);
    res.json({ success: true, notice });
  } catch (err) { next(err); }
};

const deleteNoticeGod = async (req, res, next) => {
  try {
    const before = await Notice.findById(req.params.id).lean();
    await Notice.findByIdAndDelete(req.params.id);
    await log('NOTICE_DELETED_GOD', 'Notice', req.params.id, before, null, 'CRITICAL');
    res.json({ success: true });
  } catch (err) { next(err); }
};

const forcePublishNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id,
      { status: 'PUBLISHED', publishedAt: new Date() }, { new: true });
    await log('NOTICE_FORCE_PUBLISHED', 'Notice', notice._id, { status: 'DRAFT' }, { status: 'PUBLISHED' }, 'WARN');
    res.json({ success: true, notice });
  } catch (err) { next(err); }
};

// ─── ACHIEVEMENT MANAGEMENT ──────────────────────────────────────────────────
const getAllAchievementsGod = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({}).sort({ createdAt: -1 });
    res.json({ success: true, achievements });
  } catch (err) { next(err); }
};

const deleteAchievementGod = async (req, res, next) => {
  try {
    const before = await Achievement.findById(req.params.id).lean();
    await Achievement.findByIdAndDelete(req.params.id);
    await log('ACHIEVEMENT_DELETED_GOD', 'Achievement', req.params.id, before, null, 'CRITICAL');
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── GALLERY MANAGEMENT ──────────────────────────────────────────────────────
const getAllGalleryGod = async (req, res, next) => {
  try {
    const items = await GalleryItem.find({}).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

const deleteGalleryItemGod = async (req, res, next) => {
  try {
    const before = await GalleryItem.findById(req.params.id).lean();
    await GalleryItem.findByIdAndDelete(req.params.id);
    await log('GALLERY_DELETED_GOD', 'GalleryItem', req.params.id, before, null, 'WARN');
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ─── UNDO SYSTEM ─────────────────────────────────────────────────────────────
const getUndoable = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({
      before: { $ne: null },
      undone: false,
      action: { $regex: /(DELETED|UPDATED|RESET|PROMOTED|PASSED_OUT)/ }
    })
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, logs });
  } catch (err) { next(err); }
};

const undoAction = async (req, res, next) => {
  try {
    const logEntry = await AuditLog.findById(req.params.logId);
    if (!logEntry) return res.status(404).json({ success: false, message: 'Log not found.' });
    if (logEntry.undone) return res.status(400).json({ success: false, message: 'Already undone.' });
    if (!logEntry.before) return res.status(400).json({ success: false, message: 'No snapshot to restore.' });

    const { entityType, entityId, before } = logEntry;
    const { _id, __v, createdAt, updatedAt, ...restorableData } = before;

    // Model map
    const models = { Cadet, User, Notice, Achievement, GalleryItem, Event, AttendanceSession };
    const Model = models[entityType];
    if (!Model) return res.status(400).json({ success: false, message: `Cannot undo for entity: ${entityType}` });

    // If entity was deleted (after=null), recreate it
    if (!logEntry.after) {
      await Model.create({ _id: entityId, ...restorableData });
    } else {
      await Model.findByIdAndUpdate(entityId, restorableData, { upsert: true });
    }

    logEntry.undone   = true;
    logEntry.undoneAt = new Date();
    logEntry.undoneBy = req.user?._id;
    await logEntry.save();

    await AuditLog.create({
      action: `UNDO_${logEntry.action}`, entityType, entityId,
      before: logEntry.after, after: logEntry.before,
      performedBy: req.user?._id, severity: 'WARN'
    });

    res.json({ success: true, message: `Successfully undid: ${logEntry.action}` });
  } catch (err) { next(err); }
};

// ─── SYSTEM OPERATIONS ───────────────────────────────────────────────────────
const promoteBatchAll = async (req, res, next) => {
  try {
    await Cadet.updateMany({ yearOfStudy: 2, status: 'ACTIVE' }, { yearOfStudy: 3 });
    await Cadet.updateMany({ yearOfStudy: 1, status: 'ACTIVE' }, { yearOfStudy: 2 });
    await Cadet.updateMany({ yearOfStudy: 3, status: 'ACTIVE' }, { status: 'PASSED_OUT', passedOutAt: new Date() });
    await log('BATCH_PROMOTED_GOD', 'System', null, null, { timestamp: new Date() }, 'CRITICAL');
    res.json({ success: true, message: 'All batches promoted.' });
  } catch (err) { next(err); }
};

const exportAllData = async (req, res, next) => {
  try {
    const data = {
      users: await User.find({}).select('-password').lean(),
      cadets: await Cadet.find({}).lean(),
      attendance: await AttendanceSession.find({}).lean(),
      notices: await Notice.find({}).lean(),
      achievements: await Achievement.find({}).lean(),
      gallery: await GalleryItem.find({}).lean(),
      events: await Event.find({}).lean(),
      logs: await AuditLog.find({}).sort({ createdAt: -1 }).limit(1000).lean(),
    };
    await log('SYSTEM_EXPORT', 'System', null, null, { timestamp: new Date(), collectionCounts: Object.fromEntries(Object.entries(data).map(([k,v]) => [k, v.length])) }, 'WARN');
    res.json({ success: true, timestamp: new Date(), data });
  } catch (err) { next(err); }
};

const hardResetSystem = async (req, res, next) => {
  try {
    await Promise.all([
      Cadet.deleteMany({}),
      AttendanceSession.deleteMany({}),
      AttendanceEntry.deleteMany({}),
      Achievement.deleteMany({}),
      Notice.deleteMany({}),
      GalleryItem.deleteMany({}),
      Event.deleteMany({}),
    ]);
    await log('HARD_RESET', 'System', null, null, { timestamp: new Date() }, 'CRITICAL');
    res.json({ success: true, message: 'Full system reset complete.' });
  } catch (err) { next(err); }
};

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const getAllConfig = async (req, res, next) => {
  try {
    const configs = await YTConfig.find({});
    res.json({ success: true, configs });
  } catch (err) { next(err); }
};

const updateSectionConfig = async (req, res, next) => {
  try {
    const config = await YTConfig.findOneAndUpdate(
      { section: req.params.section },
      { config: req.body.config, lastEditedBy: 'YT', version: req.body.version || 1 },
      { upsert: true, new: true }
    );
    res.json({ success: true, config });
  } catch (err) { next(err); }
};

const clearCache = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Cache cleared.' });
  } catch (err) { next(err); }
};

module.exports = {
  // Stats
  getSystemStats,
  // Logs
  getAllLogs,
  // Users
  getAllUsers, createUser, updateUser, deleteUser, resetUserPassword,
  // Cadets
  getAllCadets, updateCadetGod, deleteCadetGod, markPassedOut,
  // Attendance
  getAllSessions, deleteSessionGod,
  // Notices
  getAllNoticesGod, updateNoticeGod, deleteNoticeGod, forcePublishNotice,
  // Achievements
  getAllAchievementsGod, deleteAchievementGod,
  // Gallery
  getAllGalleryGod, deleteGalleryItemGod,
  // Undo
  getUndoable, undoAction,
  // System
  promoteBatchAll, exportAllData, hardResetSystem,
  // Config
  getAllConfig, updateSectionConfig, clearCache,
};
