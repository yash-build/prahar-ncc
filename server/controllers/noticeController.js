const Notice = require('../models/Notice');
const AuditLog = require('../models/AuditLog');
const { uploadBuffer } = require('../services/cloudinaryUpload');
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
    const noticeData = { ...req.body, unitId: req.user.unit, createdBy: req.user._id };

    if (req.file) {
      // Use 'raw' resource_type if it's a PDF to prevent image transformations
      const isPdf = req.file.mimetype === 'application/pdf';
      const resourceType = isPdf ? 'raw' : 'auto';
      const result = await uploadBuffer(req.file.buffer, 'prahar/notices', resourceType);
      
      noticeData.attachment = {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: resourceType
      };
    }

    // SUO creates as PENDING_APPROVAL; ANO creates as PUBLISHED
    noticeData.status = req.user.role === 'ANO' ? 'PUBLISHED' : 'PENDING_APPROVAL';
    if (req.user.role === 'ANO') noticeData.publishedAt = new Date();

    const notice = await Notice.create(noticeData);

    res.status(201).json({ success: true, notice });
  } catch (err) { next(err); }
};

// PUT /api/notices/:id
const updateNotice = async (req, res, next) => {
  try {
    const noticeData = { ...req.body };

    if (req.file) {
      const isPdf = req.file.mimetype === 'application/pdf';
      const resourceType = isPdf ? 'raw' : 'auto';
      const result = await uploadBuffer(req.file.buffer, 'prahar/notices', resourceType);
      
      noticeData.attachment = {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: resourceType
      };
      // Note: Ideal implementation deletes old attachment from Cloudinary here
    }

    const notice = await Notice.findByIdAndUpdate(req.params.id, noticeData, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
    
    res.json({ success: true, notice });
  } catch (err) { next(err); }
};

// DELETE /api/notices/:id
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
    
    // Cleanup Cloudinary
    if (notice.attachment?.publicId) {
      await cloudinary.uploader.destroy(notice.attachment.publicId, { resource_type: notice.attachment.resourceType }).catch(()=>null);
    }

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
    }).select('title body priority targetAudience publishedAt expiresAt attachment')
      .sort({ priority: 1, publishedAt: -1 })
      .limit(20);
    res.json({ success: true, notices });
  } catch (err) { next(err); }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice, approveNotice, rejectNotice, getPublicNotices };
