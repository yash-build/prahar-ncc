const Unit = require('../models/Unit');

// GET /api/unit
const getUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.user.unit);
    res.json({ success: true, unit });
  } catch (err) { next(err); }
};

// PUT /api/unit
const updateUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndUpdate(req.user.unit, req.body, { new: true, runValidators: true });
    res.json({ success: true, unit });
  } catch (err) { next(err); }
};

// GET /api/unit/public/:slug
const getPublicUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findOne({ slug: req.params.slug, isPublic: true });
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    res.json({ success: true, unit });
  } catch (err) { next(err); }
};

module.exports = { getUnit, updateUnit, getPublicUnit };
