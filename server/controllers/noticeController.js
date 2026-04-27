/**
 * Notice Controller
 */

const Notice = require('../models/Notice');

// ── @route   GET /api/notices ─────────────────────────────────────────────
// ── @access  Public (active notices visible to all)
const getNotices = async (req, res, next) => {
  try {
    const { wing, priority, includeExpired } = req.query;

    const filter = {};

    // By default, only show non-expired notices
    if (includeExpired !== 'true') {
      filter.expiresAt = { $gte: new Date() };
    }

    if (wing && wing !== 'ALL') {
      filter.$or = [{ targetWing: wing }, { targetWing: 'ALL' }];
    }

    if (priority) filter.priority = priority;

    const notices = await Notice.find(filter)
      .populate('createdBy', 'name role')
      .sort({ isPinned: -1, priority: 1, createdAt: -1 })
      .lean();

    // Sort: pinned first, then urgent > normal > info, then newest
    const priorityOrder = { urgent: 0, normal: 1, info: 2 };
    notices.sort((a, b) => {
      if (b.isPinned !== a.isPinned) return b.isPinned ? 1 : -1;
      return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    });

    res.json({ success: true, count: notices.length, notices });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/notices ────────────────────────────────────────────
// ── @access  Private (ANO / SUO)
const createNotice = async (req, res, next) => {
  try {
    const { title, content, priority, targetWing, expiresAt, isPinned } = req.body;

    const notice = await Notice.create({
      title,
      content,
      priority:   priority   || 'normal',
      targetWing: targetWing || 'ALL',
      expiresAt:  expiresAt  || undefined, // Uses schema default if not provided
      isPinned:   isPinned   || false,
      createdBy:  req.user._id,
    });

    res.status(201).json({ success: true, notice });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/notices/:id ─────────────────────────────────────────
// ── @access  Private (ANO only)
const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    res.json({ success: true, notice });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/notices/:id ─────────────────────────────────────
// ── @access  Private (ANO only)
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
