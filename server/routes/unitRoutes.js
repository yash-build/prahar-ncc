const router = require('express').Router();
const ctrl = require('../controllers/unitController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/public/:slug', ctrl.getPublicUnit);

router.use(protect);

router.get('/', ctrl.getUnit);
router.put('/', requireRole('ANO'), ctrl.updateUnit);

module.exports = router;
