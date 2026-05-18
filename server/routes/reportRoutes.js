const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(protect);

router.get('/dashboard-stats', requireRole('ANO', 'SUO'), ctrl.getDashboardStats);
router.get('/attendance-export', requireRole('ANO', 'SUO'), ctrl.getAttendanceExport);

router.get('/export/cadets', requireRole('ANO', 'SUO'), async (req, res, next) => {
  try {
    const Cadet = require('../models/Cadet');
    const cadets = await Cadet.find({ unitId: req.user.unit })
      .select('serviceNumber name wing rank yearOfStudy batchYear status contactPhone contactEmail enrollmentDate isDefaulter')
      .lean();

    const headers = ['Service No', 'Name', 'Wing', 'Rank', 'Year', 'Batch', 'Status', 'Phone', 'Email', 'Enrolled', 'Defaulter'];
    const rows = cadets.map(c => [
      c.serviceNumber, c.name, c.wing, c.rank, c.yearOfStudy, c.batchYear,
      c.status, c.contactPhone || '', c.contactEmail || '',
      c.enrollmentDate ? new Date(c.enrollmentDate).toLocaleDateString('en-IN') : '',
      c.isDefaulter ? 'YES' : 'NO',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="prahar-cadets-${Date.now()}.csv"`);
    res.send('\uFEFF' + csv);
  } catch (err) { next(err); }
});

module.exports = router;
