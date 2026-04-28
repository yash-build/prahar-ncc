const Cadet = require('../models/Cadet');
const BatchPromotion = require('../models/BatchPromotion');
const AuditLog = require('../models/AuditLog');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceEntry = require('../models/AttendanceEntry');
const Achievement = require('../models/Achievement');
const Notice = require('../models/Notice');

// POST /api/batch/promote
const promoteBatch = async (req, res, next) => {
  try {
    const { fromBatchYear, toBatchYear, notes } = req.body;
    const unitId = req.user.unit;

    const promoted = await Cadet.updateMany(
      { unitId, yearOfStudy: { $in: [1, 2] }, status: 'ACTIVE' },
      { $inc: { yearOfStudy: 1 }, batchYear: toBatchYear }
    );

    const passedOut = await Cadet.updateMany(
      { unitId, yearOfStudy: 3, status: 'ACTIVE' },
      { status: 'PASSED_OUT', passedOutAt: new Date() }
    );

    const record = await BatchPromotion.create({
      unitId,
      promotedBy: req.user._id,
      fromBatchYear,
      toBatchYear,
      totalPromoted: promoted.modifiedCount,
      totalPassedOut: passedOut.modifiedCount,
      notes
    });

    await AuditLog.create({
      action: 'BATCH_PROMOTED',
      entityType: 'BatchPromotion',
      entityId: record._id,
      performedBy: req.user._id,
      details: { from: fromBatchYear, to: toBatchYear, promoted: promoted.modifiedCount }
    });

    res.json({ success: true, message: 'Batch promoted successfully.', record });
  } catch (err) { next(err); }
};

// GET /api/batch/history
const getBatchHistory = async (req, res, next) => {
  try {
    const history = await BatchPromotion.find({ unitId: req.user.unit })
      .populate('promotedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (err) { next(err); }
};

// POST /api/batch/reset
const resetSystem = async (req, res, next) => {
  try {
    const unitId = req.user.unit;
    await Cadet.deleteMany({ unitId });
    await AttendanceSession.deleteMany({ unitId });
    await AttendanceEntry.deleteMany({});
    await Achievement.deleteMany({ unitId });
    await Notice.deleteMany({ unitId });

    await AuditLog.create({
      action: 'SYSTEM_RESET',
      entityType: 'System',
      entityId: req.user._id,
      performedBy: req.user._id,
      details: { message: 'All cadets, attendance, achievements, and notices wiped.' }
    });

    res.json({ success: true, message: 'System reset completely.' });
  } catch (err) { next(err); }
};

module.exports = { promoteBatch, getBatchHistory, resetSystem };
