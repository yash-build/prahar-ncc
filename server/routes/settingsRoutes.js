const router = require('express').Router();
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/public', getPublicSettings);
router.get('/', protect, requireRole('ANO'), getSettings);
router.put('/', protect, requireRole('ANO'), updateSettings);

module.exports = router;
