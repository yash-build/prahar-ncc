const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(protect);

router.get('/dashboard-stats', requireRole('ANO', 'SUO'), ctrl.getDashboardStats);
router.get('/attendance-export', requireRole('ANO', 'SUO'), ctrl.getAttendanceExport);

module.exports = router;
