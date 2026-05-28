const Settings = require('../models/Settings');
const { uploadBuffer } = require('../services/cloudinaryUpload');

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
            visibility: { gallery: true, achievements: true, yearbook: true, notices: true },
            anoProfile: {}
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
    if (req.body.anoProfile) settings.anoProfile = { ...settings.anoProfile, ...req.body.anoProfile };

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

// POST /api/settings/ano-photo — Upload ANO profile photo
const uploadAnoPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    const result = await uploadBuffer(req.file.buffer, 'prahar/ano-profile');
    const photoUrl = result.secure_url;

    let settings = await Settings.findOne({ unitId: req.user.unit });
    if (!settings) settings = new Settings({ unitId: req.user.unit });

    if (!settings.anoProfile) settings.anoProfile = {};
    settings.anoProfile.photo = photoUrl;
    await settings.save();

    res.json({ success: true, photoUrl, settings });
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
          visibility: { gallery: true, achievements: true, yearbook: true, notices: true },
          anoProfile: {}
        }
      });
    }
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

module.exports = { getSettings, updateSettings, getPublicSettings, uploadAnoPhoto };
