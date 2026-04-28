// HIDDEN ROUTES — Protected by YT secret key, not JWT
// These routes are invisible to all users except Yash Tiwari
const router = require('express').Router();
const ctrl = require('../controllers/ytController');
const requireYT = require('../middleware/requireYT');

// All routes require YT secret header
router.use(requireYT);

router.get('/config', ctrl.getAllConfig);
router.get('/config/:section', ctrl.getSectionConfig);
router.put('/config/:section', ctrl.updateSectionConfig);
router.post('/config/reset/:section', ctrl.resetSection);
router.get('/stats', ctrl.getSystemStats);
router.get('/logs', ctrl.getAllLogs);
router.post('/promote-all', ctrl.promoteBatchAll);
router.delete('/clear-cache', ctrl.clearCache);
router.get('/export', requireYT, ctrl.exportSystemData);
router.get('/export-all', ctrl.exportAllData);

module.exports = router;
