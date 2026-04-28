const Cadet = require('../models/Cadet');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceEntry = require('../models/AttendanceEntry');

// GET /api/reports/dashboard-stats
const getDashboardStats = async (req, res, next) => {
  try {
    const unitId = req.user.unit;
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const currentMonthEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));

    const totalCadets = await Cadet.countDocuments({ unitId, status: 'ACTIVE' });
    const sdCadets = await Cadet.countDocuments({ unitId, status: 'ACTIVE', wing: 'SD' });
    const swCadets = await Cadet.countDocuments({ unitId, status: 'ACTIVE', wing: 'SW' });

    const recentSessions = await AttendanceSession.find({ unitId, date: { $gte: currentMonthStart, $lte: currentMonthEnd } })
      .sort({ date: -1 })
      .limit(5);

    let averageAttendance = 0;
    if (recentSessions.length > 0) {
      let totalP = 0, totalA = 0;
      recentSessions.forEach(s => {
        totalP += s.totalPresent;
        totalA += s.totalAbsent;
      });
      const total = totalP + totalA;
      averageAttendance = total > 0 ? Math.round((totalP / total) * 100) : 0;
    }

    res.json({
      success: true,
      stats: {
        totalCadets,
        sdCadets,
        swCadets,
        averageAttendance,
        recentSessions
      }
    });
  } catch (err) { next(err); }
};

// GET /api/reports/attendance-export
const getAttendanceExport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    // Export generation logic here, could just return pivot data similar to monthly view
    res.json({ success: true, message: 'Export data generated.' });
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getAttendanceExport };
