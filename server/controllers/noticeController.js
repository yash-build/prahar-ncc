const Notice = require('../models/Notice');
const AuditLog = require('../models/AuditLog');
const cloudinary = require('../config/cloudinary');

// GET /api/notices
const getNotices = async (req, res, next) => {
  try {
    const { status, priority, audience } = req.query;
    const query = { unitId: req.user.unit };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (audience && audience !== 'ALL') query.targetAudience = { $in: [audience, 'ALL'] };

    const notices = await Notice.find(query)
      .populate('createdBy', 'name role')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, notices });
  } catch (err) { next(err); }
};

// POST /api/notices
const createNotice = async (req, res, next) => {
  try {
    let attachmentUrl;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'prahar/notices', resource_type: 'auto' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      attachmentUrl = result.secure_url;
    }

    // SUO creates as PENDING_APPROVAL; ANO creates as PUBLISHED
    const status = req.user.role === 'ANO' ? 'PUBLISHED' : 'PENDING_APPROVAL';
    const publishedAt = req.user.role === 'ANO' ? new Date() : undefined;

    const notice = await Notice.create({
      ...req.body,
      unitId: req.user.unit,
      createdBy: req.user._id,
      attachmentUrl,
      status,
      publishedAt
    });

    res.status(201).json({ success: true, notice });
  } catch (err) { next(err); }
};

// PUT /api/notices/:id
const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
    res.json({ success: true, notice });
  } catch (err) { next(err); }
};

// DELETE /api/notices/:id
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
    await AuditLog.create({
      action: 'NOTICE_DELETED', entityType: 'Notice', entityId: req.params.id,
      performedBy: req.user._id, details: { title: notice.title }
    });
    res.json({ success: true, message: 'Notice deleted.' });
  } catch (err) { next(err); }
};

// PUT /api/notices/:id/approve
const approveNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { status: 'PUBLISHED', approvedBy: req.user._id, publishedAt: new Date() },
      { new: true }
    );
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
    res.json({ success: true, notice });
  } catch (err) { next(err); }
};

// PUT /api/notices/:id/reject
const rejectNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { status: 'ARCHIVED' },
      { new: true }
    );
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
    res.json({ success: true, notice });
  } catch (err) { next(err); }
};

// Public notices — no auth
const getPublicNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find({
      status: 'PUBLISHED',
      expiresAt: { $gte: new Date() }
    }).select('title body priority targetAudience publishedAt expiresAt')
      .sort({ priority: 1, publishedAt: -1 })
      .limit(20);
    res.json({ success: true, notices });
  } catch (err) { next(err); }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice, approveNotice, rejectNotice, getPublicNotices };
