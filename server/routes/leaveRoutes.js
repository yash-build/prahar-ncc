const router = require('express').Router();
const ctrl = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

router.use(protect);

// Cadet routes
router.post('/apply', requireRole('cadet'), upload.single('attachment'), ctrl.applyLeave);
router.get('/my', requireRole('cadet'), ctrl.getMyLeaves);

// ANO/SUO routes
router.get('/', requireRole('ANO', 'SUO'), ctrl.getAllLeaves);
router.put('/:id/review', requireRole('ANO', 'SUO'), ctrl.reviewLeave);

module.exports = router;
