// ERROR FIX #1: Single router — not combined with notices
const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(protect);

router.get('/sessions', ctrl.getSessions);
router.post('/sessions', requireRole('ANO', 'SUO'), ctrl.createSession);
router.get('/sessions/:id', ctrl.getSession);
router.put('/sessions/:id/submit', requireRole('ANO', 'SUO'), ctrl.submitSession);
router.delete('/sessions/:id', requireRole('ANO'), ctrl.deleteSession);

router.get('/sessions/:sessionId/entries', ctrl.getEntries);
router.post('/sessions/:sessionId/entries', requireRole('ANO', 'SUO'), ctrl.saveEntries);

router.post('/override', requireRole('ANO'), ctrl.overrideEntry);
router.get('/cadet/:cadetId', ctrl.getCadetAttendance);
router.get('/monthly', ctrl.getMonthlyView);
router.get('/defaulters', ctrl.getDefaulters);

module.exports = router; // Single export
