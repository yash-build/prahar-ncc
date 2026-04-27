/**
 * Cadet Controller
 * Full CRUD for cadet registry
 * Image upload handled via Cloudinary middleware
 */

const Cadet       = require('../models/Cadet');
const Achievement = require('../models/Achievement');
const AttendanceSession = require('../models/AttendanceSession');
const { cloudinary } = require('../config/cloudinary');

// ── @route   GET /api/cadets ──────────────────────────────────────────────
// ── @access  Public
// Supports filtering: ?wing=SD&rank=Sgt&year=2&search=ravi
const getCadets = async (req, res, next) => {
  try {
    const { wing, rank, year, search, isActive = 'true', isHonored } = req.query;

    const filter = {};

    if (wing)      filter.wing = wing;
    if (rank)      filter.rank = rank;
    if (year)      filter.year = Number(year);
    if (isHonored) filter.isHonored = isHonored === 'true';

    // isActive defaults to true (show active cadets only)
    filter.isActive = isActive === 'true';

    // Full-text search on name or regNo
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort: by rank (senior first), then name alphabetically
    const RANK_ORDER = { SUO: 0, JUO: 1, Sgt: 2, Cpl: 3, 'L/Cpl': 4, Cadet: 5 };

    const cadets = await Cadet.find(filter)
      .select('name regNo wing rank year photoUrl isHonored enrolledAt')
      .lean();

    // Sort in memory — rank enum not naturally sortable in MongoDB
    cadets.sort((a, b) => {
      const rankDiff = (RANK_ORDER[a.rank] ?? 99) - (RANK_ORDER[b.rank] ?? 99);
      if (rankDiff !== 0) return rankDiff;
      return a.name.localeCompare(b.name);
    });

    res.json({ success: true, count: cadets.length, cadets });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/cadets/:id ──────────────────────────────────────────
// ── @access  Public (detail view)
const getCadet = async (req, res, next) => {
  try {
    const cadet = await Cadet.findById(req.params.id).lean();
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found' });

    // Fetch achievements for this cadet
    const achievements = await Achievement.find({ cadet: cadet._id })
      .sort({ date: -1 })
      .lean();

    // Calculate attendance % for current semester
    // "Current semester" = last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sessions = await AttendanceSession.find({
      date: { $gte: sixMonthsAgo },
      $or: [{ wing: cadet.wing }, { wing: 'ALL' }],
    }).lean();

    // Only count sessions that happened after cadet enrolled
    const relevantSessions = sessions.filter(s => new Date(s.date) >= new Date(cadet.enrolledAt));

    let presentCount = 0;
    for (const session of relevantSessions) {
      const record = session.records.find(r => r.cadet.toString() === cadet._id.toString());
      if (record?.status === 'present') presentCount++;
    }

    const attendancePct = relevantSessions.length > 0
      ? Math.round((presentCount / relevantSessions.length) * 100)
      : null; // null = no sessions yet

    res.json({
      success: true,
      cadet: {
        ...cadet,
        achievements,
        attendance: {
          percentage:     attendancePct,
          sessionsTotal:  relevantSessions.length,
          sessionsPresent: presentCount,
          isDefaulter:    attendancePct !== null && attendancePct < 75,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/cadets ─────────────────────────────────────────────
// ── @access  Private (ANO only)
const createCadet = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // If image was uploaded via multer-cloudinary, attach URL
    if (req.file) {
      data.photoUrl      = req.file.path;
      data.photoPublicId = req.file.filename;
    }

    const cadet = await Cadet.create(data);
    res.status(201).json({ success: true, cadet });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/cadets/:id ──────────────────────────────────────────
// ── @access  Private (ANO only)
const updateCadet = async (req, res, next) => {
  try {
    const cadet = await Cadet.findById(req.params.id);
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found' });

    // If a new photo is uploaded, delete old one from Cloudinary
    if (req.file && cadet.photoPublicId) {
      await cloudinary.uploader.destroy(cadet.photoPublicId).catch(() => {});
      req.body.photoUrl      = req.file.path;
      req.body.photoPublicId = req.file.filename;
    }

    // Prevent updating regNo if it already exists elsewhere
    if (req.body.regNo && req.body.regNo !== cadet.regNo) {
      const exists = await Cadet.findOne({ regNo: req.body.regNo });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Registration number already in use' });
      }
    }

    const updated = await Cadet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, cadet: updated });
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/cadets/:id/honor ─────────────────────────────────
// ── @access  Private (ANO only)
const toggleHonor = async (req, res, next) => {
  try {
    const { honorNote } = req.body;
    const cadet = await Cadet.findById(req.params.id);
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found' });

    cadet.isHonored  = !cadet.isHonored;
    cadet.honorNote  = cadet.isHonored ? (honorNote || '') : '';
    await cadet.save();

    res.json({
      success: true,
      message: cadet.isHonored ? 'Cadet added to Honor Board' : 'Cadet removed from Honor Board',
      isHonored: cadet.isHonored,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/cadets/:id/message ────────────────────────────────
// ── @access  Private (ANO only)
const updateMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message && message !== '') {
      return res.status(400).json({ success: false, message: 'Message content required' });
    }

    const cadet = await Cadet.findByIdAndUpdate(
      req.params.id,
      { personalMessage: message.trim().substring(0, 500) },
      { new: true, select: 'personalMessage' }
    );

    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found' });

    res.json({ success: true, personalMessage: cadet.personalMessage });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/cadets/:id ──────────────────────────────────────
// ── @access  Private (ANO only)
// Soft-delete: marks isActive = false (data preserved)
const deleteCadet = async (req, res, next) => {
  try {
    const cadet = await Cadet.findById(req.params.id);
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found' });

    cadet.isActive = false;
    await cadet.save();

    res.json({ success: true, message: 'Cadet marked as inactive (soft delete)' });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/cadets/defaulters ──────────────────────────────────
// ── @access  Private
const getDefaulters = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get all sessions in last 6 months
    const sessions = await AttendanceSession.find({
      date: { $gte: sixMonthsAgo },
    }).lean();

    if (sessions.length === 0) {
      return res.json({ success: true, defaulters: [] });
    }

    // Build a map: cadetId → { present, total }
    const cadetMap = {};
    for (const session of sessions) {
      for (const record of session.records) {
        const cid = record.cadet.toString();
        if (!cadetMap[cid]) cadetMap[cid] = { present: 0, total: 0 };
        cadetMap[cid].total++;
        if (record.status === 'present') cadetMap[cid].present++;
      }
    }

    // Find cadets with < 75% attendance
    const defaulterIds = Object.entries(cadetMap)
      .filter(([, stats]) => stats.total > 0 && (stats.present / stats.total) < 0.75)
      .map(([id]) => id);

    const cadets = await Cadet.find({
      _id:      { $in: defaulterIds },
      isActive: true,
    }).select('name regNo wing rank year photoUrl').lean();

    // Attach their attendance %
    const result = cadets.map(c => ({
      ...c,
      attendancePct: Math.round(
        (cadetMap[c._id.toString()].present / cadetMap[c._id.toString()].total) * 100
      ),
    }));

    result.sort((a, b) => a.attendancePct - b.attendancePct);

    res.json({ success: true, count: result.length, defaulters: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCadets,
  getCadet,
  createCadet,
  updateCadet,
  deleteCadet,
  toggleHonor,
  updateMessage,
  getDefaulters,
};
