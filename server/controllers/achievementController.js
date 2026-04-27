/**
 * Achievement Controller
 */

const Achievement = require('../models/Achievement');
const Cadet       = require('../models/Cadet');

// ── @route   GET /api/achievements/cadet/:cadetId ─────────────────────────
// ── @access  Public
const getCadetAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ cadet: req.params.cadetId })
      .sort({ date: -1 })
      .populate('addedBy', 'name')
      .lean();

    res.json({ success: true, achievements });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/achievements ──────────────────────────────────────
// ── @access  Private (ANO only)
const addAchievement = async (req, res, next) => {
  try {
    const { cadetId, title, type, level, description, date, certificateUrl } = req.body;

    // Confirm cadet exists
    const cadet = await Cadet.findById(cadetId);
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found' });

    const achievement = await Achievement.create({
      cadet:          cadetId,
      title,
      type,
      level,
      description,
      date,
      certificateUrl: certificateUrl || '',
      addedBy:        req.user._id,
    });

    res.status(201).json({ success: true, achievement });
  } catch (err) {
    next(err);
  }
};

// ── @route   PUT /api/achievements/:id ───────────────────────────────────
// ── @access  Private (ANO only)
const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });

    res.json({ success: true, achievement });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/achievements/:id ────────────────────────────────
// ── @access  Private (ANO only)
const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });

    res.json({ success: true, message: 'Achievement deleted' });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/achievements/recent ────────────────────────────────
// ── @access  Public — for public showcase on landing page
const getRecentAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({})
      .sort({ date: -1 })
      .limit(10)
      .populate('cadet', 'name rank wing photoUrl')
      .lean();

    res.json({ success: true, achievements });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCadetAchievements,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  getRecentAchievements,
};
