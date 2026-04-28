const router = require('express').Router();
const ctrl = require('../controllers/auditController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(protect);

router.get('/', requireRole('ANO'), ctrl.getLogs);

module.exports = router;
