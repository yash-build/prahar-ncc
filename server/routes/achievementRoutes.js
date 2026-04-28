const router = require('express').Router();
const ctrl   = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload      = require('../middleware/upload');

// ── Public route (no auth) ──
router.get('/public', ctrl.getPublicAchievements);

// ── All routes below require auth ──
router.use(protect);

router.get('/',              ctrl.getAchievements);
router.get('/admin',         ctrl.getAchievements);  // alias for dashboard
router.post('/', upload.single('certificate'),        ctrl.createAchievement);
router.put('/:id',         requireRole('ANO','SUO'),  ctrl.updateAchievement);
router.delete('/:id',      requireRole('ANO'),        ctrl.deleteAchievement);
router.put('/:id/approve', requireRole('ANO'),        ctrl.approveAchievement);
router.put('/:id/reject',  requireRole('ANO'),        ctrl.rejectAchievement);

module.exports = router;
