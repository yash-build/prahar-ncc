const router = require('express').Router();
const ctrl = require('../controllers/batchController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(protect);

router.post('/promote', requireRole('ANO'), ctrl.promoteBatch);
router.get('/history', requireRole('ANO'), ctrl.getBatchHistory);

module.exports = router;
