const Leave = require('../models/Leave');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceEntry = require('../models/AttendanceEntry');
const Cadet = require('../models/Cadet');
const AuditLog = require('../models/AuditLog');
const { uploadBuffer } = require('../services/cloudinaryUpload');

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// POST /api/leaves
const applyLeave = async (req, res, next) => {
  try {
    const cadet = await Cadet.findOne({ authId: req.user._id });
    if (!cadet) return res.status(403).json({ success: false, message: 'Only cadets can apply for leave.' });

    const leaveData = {
      unitId: cadet.unitId,
      cadetId: cadet._id,
      startDate: normalizeDate(req.body.startDate),
      endDate: normalizeDate(req.body.endDate),
      reason: req.body.reason
    };

    if (req.file) {
      const isPdf = req.file.mimetype === 'application/pdf';
      const resourceType = isPdf ? 'raw' : 'auto';
      const result = await uploadBuffer(req.file.buffer, 'prahar/leaves', resourceType);
      leaveData.attachment = {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType
      };
    }

    const leave = await Leave.create(leaveData);
    res.status(201).json({ success: true, leave });
  } catch (err) { next(err); }
};

// GET /api/leaves/my
const getMyLeaves = async (req, res, next) => {
  try {
    const cadet = await Cadet.findOne({ authId: req.user._id });
    if (!cadet) return res.status(403).json({ success: false, message: 'Only cadets have leave history.' });

    const leaves = await Leave.find({ cadetId: cadet._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, leaves });
  } catch (err) { next(err); }
};

// GET /api/leaves (ANO/SUO)
const getAllLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { unitId: req.user.unit };
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('cadetId', 'name serviceNumber rank wing')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, leaves });
  } catch (err) { next(err); }
};

// PUT /api/leaves/:id/review (ANO/SUO)
const reviewLeave = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Leave already reviewed' });

    leave.status = status;
    leave.remarks = remarks;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    // Find any existing attendance sessions within this leave period
    const sessions = await AttendanceSession.find({
      unitId: leave.unitId,
      date: { $gte: leave.startDate, $lte: leave.endDate }
    });

    // Update attendance entries for this cadet in existing sessions
    for (const session of sessions) {
      const entryStatus = status === 'APPROVED' ? 'L' : 'A';
      await AttendanceEntry.findOneAndUpdate(
        { sessionId: session._id, cadetId: leave.cadetId },
        { status: entryStatus, leaveReason: status === 'APPROVED' ? 'OTHER' : undefined },
        { upsert: true, new: true }
      );
      
      // Recalculate session totals
      const entries = await AttendanceEntry.find({ sessionId: session._id });
      session.totalPresent = entries.filter(e => e.status === 'P').length;
      session.totalAbsent = entries.filter(e => e.status === 'A').length;
      session.totalLeave = entries.filter(e => e.status === 'L').length;
      await session.save();
    }

    await AuditLog.create({
      action: `LEAVE_${status}`,
      entityType: 'Leave',
      entityId: leave._id,
      performedBy: req.user._id,
      details: { cadetId: leave.cadetId, remarks }
    });

    res.json({ success: true, leave });
  } catch (err) { next(err); }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave };
