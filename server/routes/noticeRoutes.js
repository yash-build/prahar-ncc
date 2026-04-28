const router = require('express').Router();
const ctrl   = require('../controllers/noticeController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload      = require('../middleware/upload');

// ── Public route (no auth) ──
router.get('/public', ctrl.getPublicNotices);

// ── All routes below require auth ──
router.use(protect);

router.get('/',                                           ctrl.getNotices);
router.post('/', requireRole('ANO','SUO'), upload.single('attachment'), ctrl.createNotice);
router.put('/:id',         requireRole('ANO','SUO'),     ctrl.updateNotice);
router.delete('/:id',      requireRole('ANO'),           ctrl.deleteNotice);
router.put('/:id/approve', requireRole('ANO'),           ctrl.approveNotice);
router.put('/:id/reject',  requireRole('ANO'),           ctrl.rejectNotice);

module.exports = router;
