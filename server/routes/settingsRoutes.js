const router = require('express').Router();
const { getSettings, updateSettings, getPublicSettings, uploadAnoPhoto } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

router.get('/public', getPublicSettings);
router.get('/', protect, requireRole('ANO'), getSettings);
router.put('/', protect, requireRole('ANO'), updateSettings);
router.post('/ano-photo', protect, requireRole('ANO'), upload.single('photo'), uploadAnoPhoto);

module.exports = router;
