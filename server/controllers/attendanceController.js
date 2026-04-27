/**
 * Attendance Controller
 *
 * Core logic:
 * - Create a new session (date + wing)
 * - Bulk-populate records from active cadets
 * - Mark individual/all cadets present/absent
 * - Fetch session history
 * - Monthly summary per cadet
 */

const AttendanceSession = require('../models/AttendanceSession');
const Cadet             = require('../models/Cadet');

// ── @route   GET /api/attendance/sessions ─────────────────────────────────
// ── @access  Private
// ?wing=ALL&month=2024-03 (YYYY-MM)
const getSessions = async (req, res, next) => {
  try {
    const { wing, month } = req.query;

    const filter = {};
    if (wing) filter.wing = wing;

    if (month) {
      // month = "2024-03" → filter from March 1 to March 31
      const [year, m] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lte: new Date(year, m, 0, 23, 59, 59), // last day of month
      };
    }

    const sessions = await AttendanceSession.find(filter)
      .select('date sessionLabel wing isLocked createdAt markedBy records')
      .populate('markedBy', 'name role')
      .sort({ date: -1 })
      .lean();

    // Attach summary counts without sending all records
    const withSummary = sessions.map(s => ({
      _id:          s._id,
      date:         s.date,
      sessionLabel: s.sessionLabel,
      wing:         s.wing,
      isLocked:     s.isLocked,
      markedBy:     s.markedBy,
      createdAt:    s.createdAt,
      totalCadets:  s.records.length,
      presentCount: s.records.filter(r => r.status === 'present').length,
    }));

    res.json({ success: true, sessions: withSummary });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/attendance/sessions/:id ─────────────────────────────
// ── @access  Private
// Full session with all cadet records (for marking attendance)
const getSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('records.cadet', 'name regNo wing rank year photoUrl')
      .populate('markedBy', 'name role')
      .lean();

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/attendance/sessions ────────────────────────────────
// ── @access  Private (ANO / SUO)
// Creates a session and auto-populates it with all active cadets
const createSession = async (req, res, next) => {
  try {
    const { date, sessionLabel = 'Parade', wing = 'ALL' } = req.body;

    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    // Check for duplicate session on same date + wing
    const existingSession = await AttendanceSession.findOne({
      date: new Date(date),
      wing,
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'A session already exists for this date and wing',
        sessionId: existingSession._id,
      });
    }

    // Fetch all active cadets for the target wing
    const cadetFilter = { isActive: true };
    if (wing !== 'ALL') cadetFilter.wing = wing;

    const cadets = await Cadet.find(cadetFilter).select('_id enrolledAt').lean();

    const sessionDate = new Date(date);

    // Build records — all cadets default to 'absent'
    // Only include cadets enrolled before or on this session date
    const records = cadets
      .filter(c => new Date(c.enrolledAt) <= sessionDate)
      .map(c => ({ cadet: c._id, status: 'absent', remark: '' }));

    const session = await AttendanceSession.create({
      date:         sessionDate,
      sessionLabel,
      wing,
      records,
      markedBy:     req.user._id,
      lastEditedAt: new Date(),
      lastEditedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: `Session created with ${records.length} cadets`,
      sessionId: session._id,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/attendance/sessions/:id/mark ─────────────────────
// ── @access  Private (ANO or SUO — but ANO can override locked sessions)
// Body: { updates: [{ cadetId, status, remark }] }
// Supports bulk updates (pass multiple in one request)
const markAttendance = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No updates provided' });
    }

    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    // Locked sessions can only be edited by ANO
    if (session.isLocked && req.user.role !== 'ANO') {
      return res.status(403).json({
        success: false,
        message: 'This session is locked — only ANO can modify it',
      });
    }

    // Apply each update
    let updatedCount = 0;
    for (const { cadetId, status, remark } of updates) {
      const record = session.records.find(r => r.cadet.toString() === cadetId);
      if (record) {
        if (status) record.status = status;
        if (remark !== undefined) record.remark = remark;
        updatedCount++;
      }
    }

    session.lastEditedAt = new Date();
    session.lastEditedBy = req.user._id;
    await session.save();

    res.json({ success: true, message: `${updatedCount} record(s) updated` });
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/attendance/sessions/:id/bulk ─────────────────────
// ── @access  Private
// Mark ALL cadets as present or absent in one click
const bulkMark = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be present or absent' });
    }

    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (session.isLocked && req.user.role !== 'ANO') {
      return res.status(403).json({ success: false, message: 'Session is locked' });
    }

    session.records.forEach(r => { r.status = status; });
    session.lastEditedAt = new Date();
    session.lastEditedBy = req.user._id;
    await session.save();

    res.json({ success: true, message: `All ${session.records.length} records marked as ${status}` });
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/attendance/sessions/:id/lock ─────────────────────
// ── @access  Private (ANO only)
const toggleLock = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    session.isLocked = !session.isLocked;
    await session.save();

    res.json({
      success: true,
      message: `Session ${session.isLocked ? 'locked' : 'unlocked'}`,
      isLocked: session.isLocked,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/attendance/cadet/:cadetId ───────────────────────────
// ── @access  Private
// Monthly breakdown for a specific cadet
const getCadetAttendance = async (req, res, next) => {
  try {
    const cadet = await Cadet.findById(req.params.cadetId).lean();
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found' });

    const sessions = await AttendanceSession.find({
      date: { $gte: new Date(cadet.enrolledAt) },
      $or: [{ wing: cadet.wing }, { wing: 'ALL' }],
    }).select('date sessionLabel records').lean();

    // Build month-by-month breakdown
    const monthMap = {};
    for (const session of sessions) {
      const record = session.records.find(r => r.cadet.toString() === cadet._id.toString());
      if (!record) continue;

      const monthKey = session.date.toISOString().substring(0, 7); // "YYYY-MM"
      if (!monthMap[monthKey]) monthMap[monthKey] = { present: 0, total: 0 };
      monthMap[monthKey].total++;
      if (record.status === 'present') monthMap[monthKey].present++;
    }

    const monthly = Object.entries(monthMap)
      .map(([month, stats]) => ({
        month,
        present:    stats.present,
        total:      stats.total,
        percentage: Math.round((stats.present / stats.total) * 100),
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    res.json({ success: true, monthly });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSessions,
  getSession,
  createSession,
  markAttendance,
  bulkMark,
  toggleLock,
  getCadetAttendance,
};
