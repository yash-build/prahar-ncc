const router = require('express').Router();
const ctrl = require('../controllers/ytController');

const SECRET = process.env.YT_GOD_SECRET || 'PRAHAR_YT_2024_HIDDEN';

// God Mode auth middleware — secret header
const godAuth = (req, res, next) => {
  const key = req.headers['x-yt-secret'];
  if (key !== SECRET) return res.status(403).json({ success: false, message: 'Access denied.' });
  next();
};

router.use(godAuth);

// ── Stats ──────────────────────────────────────────────────────────────────
router.get('/stats',       ctrl.getSystemStats);

// ── Audit Logs ────────────────────────────────────────────────────────────
router.get('/logs',        ctrl.getAllLogs);

// ── User Management ───────────────────────────────────────────────────────
router.get('/users',                    ctrl.getAllUsers);
router.post('/users',                   ctrl.createUser);
router.put('/users/:id',                ctrl.updateUser);
router.delete('/users/:id',             ctrl.deleteUser);
router.post('/users/:id/reset-password',ctrl.resetUserPassword);

// ── Cadet Management ──────────────────────────────────────────────────────
router.get('/cadets',                  ctrl.getAllCadets);
router.put('/cadets/:id',              ctrl.updateCadetGod);
router.delete('/cadets/:id',           ctrl.deleteCadetGod);
router.post('/cadets/:id/passed-out',  ctrl.markPassedOut);

// ── Attendance ────────────────────────────────────────────────────────────
router.get('/attendance',              ctrl.getAllSessions);
router.delete('/attendance/:id',       ctrl.deleteSessionGod);

// ── Notices ───────────────────────────────────────────────────────────────
router.get('/notices',                 ctrl.getAllNoticesGod);
router.put('/notices/:id',             ctrl.updateNoticeGod);
router.delete('/notices/:id',          ctrl.deleteNoticeGod);
router.post('/notices/:id/publish',    ctrl.forcePublishNotice);

// ── Achievements ──────────────────────────────────────────────────────────
router.get('/achievements',            ctrl.getAllAchievementsGod);
router.delete('/achievements/:id',     ctrl.deleteAchievementGod);

// ── Gallery ───────────────────────────────────────────────────────────────
router.get('/gallery',                 ctrl.getAllGalleryGod);
router.delete('/gallery/:id',          ctrl.deleteGalleryItemGod);

// ── Undo System ───────────────────────────────────────────────────────────
router.get('/undo',                    ctrl.getUndoable);
router.post('/undo/:logId',            ctrl.undoAction);

// ── System Operations ─────────────────────────────────────────────────────
router.post('/promote-all',            ctrl.promoteBatchAll);
router.get('/export-all',              ctrl.exportAllData);
router.post('/hard-reset',             ctrl.hardResetSystem);

// ── Config ────────────────────────────────────────────────────────────────
router.get('/config',                  ctrl.getAllConfig);
router.put('/config/:section',         ctrl.updateSectionConfig);
router.post('/clear-cache',            ctrl.clearCache);

module.exports = router;
