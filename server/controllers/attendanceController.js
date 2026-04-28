const AttendanceSession = require('../models/AttendanceSession');
const AttendanceEntry = require('../models/AttendanceEntry');
const AttendanceOverride = require('../models/AttendanceOverride');
const Cadet = require('../models/Cadet');
const AuditLog = require('../models/AuditLog');

const normalizeDate = (dateInput) => {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// GET /api/attendance/sessions
const getSessions = async (req, res, next) => {
  try {
    const { month, year, sessionType } = req.query;
    const query = { unitId: req.user.unit };

    if (month && year) {
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      query.date = { $gte: start, $lte: end };
    }
    if (sessionType) query.sessionType = sessionType;

    const sessions = await AttendanceSession.find(query)
      .populate('submittedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, sessions });
  } catch (err) { next(err); }
};

// POST /api/attendance/sessions
const createSession = async (req, res, next) => {
  try {
    const { date, sessionType, isMandatory, notes } = req.body;

    const session = await AttendanceSession.create({
      unitId: req.user.unit,
      date: normalizeDate(date),
      sessionType,
      isMandatory: isMandatory !== undefined ? isMandatory : true,
      notes
    });

    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
};

// GET /api/attendance/sessions/:id
const getSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id).populate('submittedBy', 'name');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, session });
  } catch (err) { next(err); }
};

// PUT /api/attendance/sessions/:id/submit
const submitSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findByIdAndUpdate(
      req.params.id,
      { isLocked: true, submittedBy: req.user._id, submittedAt: new Date() },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    await AuditLog.create({
      action: 'ATTENDANCE_SUBMITTED',
      entityType: 'AttendanceSession',
      entityId: session._id,
      performedBy: req.user._id,
      details: { date: session.date, sessionType: session.sessionType }
    });

    res.json({ success: true, session });
  } catch (err) { next(err); }
};

// DELETE /api/attendance/sessions/:id
const deleteSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.isLocked) return res.status(400).json({ success: false, message: 'Cannot delete a locked/submitted session.' });

    await AttendanceEntry.deleteMany({ sessionId: session._id });
    await session.deleteOne();

    res.json({ success: true, message: 'Session and all entries deleted.' });
  } catch (err) { next(err); }
};

// GET /api/attendance/sessions/:sessionId/entries
const getEntries = async (req, res, next) => {
  try {
    const entries = await AttendanceEntry.find({ sessionId: req.params.sessionId })
      .populate('cadetId', 'name rank wing serviceNumber photoThumbUrl');
    res.json({ success: true, entries });
  } catch (err) { next(err); }
};

// POST /api/attendance/sessions/:sessionId/entries — bulk save
const saveEntries = async (req, res, next) => {
  try {
    const { entries } = req.body; // [{ cadetId, status, leaveReason }]
    const sessionId = req.params.sessionId;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.isLocked) return res.status(400).json({ success: false, message: 'Session is locked.' });

    // Bulk upsert
    const ops = entries.map(e => ({
      updateOne: {
        filter: { sessionId, cadetId: e.cadetId },
        update: { $set: { status: e.status, leaveReason: e.leaveReason || undefined } },
        upsert: true
      }
    }));
    await AttendanceEntry.bulkWrite(ops);

    // Recount totals
    const [present, absent, leave] = await Promise.all([
      AttendanceEntry.countDocuments({ sessionId, status: 'P' }),
      AttendanceEntry.countDocuments({ sessionId, status: 'A' }),
      AttendanceEntry.countDocuments({ sessionId, status: 'L' })
    ]);

    await AttendanceSession.findByIdAndUpdate(sessionId, {
      totalPresent: present, totalAbsent: absent, totalLeave: leave
    });

    res.json({ success: true, message: 'Entries saved.', totals: { present, absent, leave } });
  } catch (err) { next(err); }
};

// POST /api/attendance/override
const overrideEntry = async (req, res, next) => {
  try {
    const { entryId, newStatus, reason } = req.body;

    const entry = await AttendanceEntry.findById(entryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found.' });

    const previousStatus = entry.status;

    await AttendanceOverride.create({
      entryId,
      cadetId: entry.cadetId,
      sessionId: entry.sessionId,
      previousStatus,
      newStatus,
      reason,
      overriddenBy: req.user._id
    });

    entry.status = newStatus;
    await entry.save();

    res.json({ success: true, message: 'Override applied.' });
  } catch (err) { next(err); }
};

// GET /api/attendance/cadet/:cadetId
const getCadetAttendance = async (req, res, next) => {
  try {
    const entries = await AttendanceEntry.find({ cadetId: req.params.cadetId })
      .populate('sessionId', 'date sessionType isMandatory')
      .sort({ 'sessionId.date': -1 });

    const total = entries.length;
    const present = entries.filter(e => e.status === 'P').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({ success: true, entries, stats: { total, present, percentage } });
  } catch (err) { next(err); }
};

// GET /api/attendance/monthly
const getMonthlyView = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const sessions = await AttendanceSession.find({
      unitId: req.user.unit,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    const cadets = await Cadet.find({ unitId: req.user.unit, status: 'ACTIVE' })
      .select('name rank wing serviceNumber')
      .sort({ name: 1 });

    const sessionIds = sessions.map(s => s._id);
    const allEntries = await AttendanceEntry.find({ sessionId: { $in: sessionIds } });

    // Build pivot table: cadetId -> [{ sessionId, status }]
    const pivot = {};
    cadets.forEach(c => { pivot[c._id.toString()] = {}; });
    allEntries.forEach(e => {
      if (pivot[e.cadetId.toString()]) {
        pivot[e.cadetId.toString()][e.sessionId.toString()] = e.status;
      }
    });

    res.json({ success: true, sessions, cadets, pivot });
  } catch (err) { next(err); }
};

// GET /api/attendance/defaulters
const getDefaulters = async (req, res, next) => {
  try {
    const { threshold = 75 } = req.query;
    const cadets = await Cadet.find({ unitId: req.user.unit, status: 'ACTIVE' });

    const result = [];
    for (const cadet of cadets) {
      const entries = await AttendanceEntry.find({ cadetId: cadet._id });
      const total = entries.length;
      const present = entries.filter(e => e.status === 'P').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      if (percentage < Number(threshold)) {
        result.push({ cadet, total, present, percentage });
      }
    }

    result.sort((a, b) => a.percentage - b.percentage);
    res.json({ success: true, defaulters: result });
  } catch (err) { next(err); }
};

module.exports = {
  getSessions, createSession, getSession, submitSession, deleteSession,
  getEntries, saveEntries, overrideEntry, getCadetAttendance, getMonthlyView, getDefaulters
};
