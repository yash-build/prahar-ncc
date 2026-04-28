const Achievement = require('../models/Achievement');
const AuditLog = require('../models/AuditLog');
const cloudinary = require('../config/cloudinary');

// GET /api/achievements
const getAchievements = async (req, res, next) => {
  try {
    const { status, level, search, page = 1, limit = 50 } = req.query;
    const query = { unitId: req.user.unit };

    if (status) query.status = status;
    if (level) query.level = level;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Achievement.countDocuments(query);
    const achievements = await Achievement.find(query)
      .populate('cadetId', 'name rank serviceNumber photoThumbUrl')
      .populate('suggestedBy', 'name role')
      .populate('approvedBy', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, achievements, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// POST /api/achievements
const createAchievement = async (req, res, next) => {
  try {
    let certificateUrl;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'prahar/achievements', resource_type: 'auto' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      certificateUrl = result.secure_url;
    }

    const isAno = req.user.role === 'ANO';
    const status = isAno ? 'APPROVED' : 'SUGGESTED';
    const approvedBy = isAno ? req.user._id : undefined;

    const achievement = await Achievement.create({
      ...req.body,
      unitId: req.user.unit,
      suggestedBy: req.user._id,
      addedBy: req.user._id,
      certificateUrl,
      status,
      approvedBy
    });

    await AuditLog.create({
      action: 'ACHIEVEMENT_CREATED',
      entityType: 'Achievement',
      entityId: achievement._id,
      performedBy: req.user._id,
      details: { name: achievement.name, type: achievement.type }
    });

    res.status(201).json({ success: true, achievement });
  } catch (err) { next(err); }
};

// PUT /api/achievements/:id
const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });
    
    await AuditLog.create({
      action: 'ACHIEVEMENT_UPDATED',
      entityType: 'Achievement',
      entityId: achievement._id,
      performedBy: req.user._id
    });
    res.json({ success: true, achievement });
  } catch (err) { next(err); }
};

// DELETE /api/achievements/:id
const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });

    await AuditLog.create({
      action: 'ACHIEVEMENT_DELETED',
      entityType: 'Achievement',
      entityId: req.params.id,
      performedBy: req.user._id,
      details: { name: achievement.name }
    });

    res.json({ success: true, message: 'Achievement deleted.' });
  } catch (err) { next(err); }
};

// PUT /api/achievements/:id/approve
const approveAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { status: 'APPROVED', approvedBy: req.user._id },
      { new: true }
    );
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });
    res.json({ success: true, achievement });
  } catch (err) { next(err); }
};

// PUT /api/achievements/:id/reject
const rejectAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { status: 'REJECTED' },
      { new: true }
    );
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found.' });
    res.json({ success: true, achievement });
  } catch (err) { next(err); }
};

// GET /api/achievements/public
const getPublicAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ showOnPublic: true, status: 'APPROVED' })
      .populate('cadetId', 'name rank wing photoThumbUrl')
      .sort({ date: -1 })
      .limit(20);
    res.json({ success: true, achievements });
  } catch (err) { next(err); }
};

module.exports = { getAchievements, createAchievement, updateAchievement, deleteAchievement, approveAchievement, rejectAchievement, getPublicAchievements };
