const Settings = require('../models/Settings');

// GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    const unitId = req.user ? req.user.unit : null;
    let settings;
    if (unitId) {
      settings = await Settings.findOne({ unitId });
      if (!settings) settings = await Settings.create({ unitId });
    } else {
      settings = await Settings.findOne();
      if (!settings) {
        return res.json({
          success: true,
          settings: {
            stats: { cadets: '200+', accuracy: '98%', wings: '3', uptime: '24/7', battalion: '17 CG BN NCC', college: 'LCIT College' },
            visibility: { gallery: true, achievements: true, yearbook: true, notices: true }
          }
        });
      }
    }
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ unitId: req.user.unit });
    if (!settings) settings = new Settings({ unitId: req.user.unit });

    if (req.body.stats) settings.stats = { ...settings.stats, ...req.body.stats };
    if (req.body.visibility) settings.visibility = { ...settings.visibility, ...req.body.visibility };

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// GET /api/settings/public
const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.json({
        success: true,
        settings: {
          stats: { cadets: '200+', accuracy: '98%', wings: '3', uptime: '24/7', battalion: '17 CG BN NCC', college: 'LCIT College' },
          visibility: { gallery: true, achievements: true, yearbook: true, notices: true }
        }
      });
    }
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

module.exports = { getSettings, updateSettings, getPublicSettings };
