const router = require('express').Router();
const ctrl = require('../controllers/cadetController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

router.get('/public', ctrl.getPublicCadets);

router.use(protect);

router.get('/', requireRole('ANO', 'SUO'), ctrl.getCadets);
router.post('/', requireRole('ANO', 'SUO'), upload.single('photo'), ctrl.createCadet);
router.post('/batch', requireRole('ANO'), ctrl.createCadetsBatch);
router.get('/:id', requireRole('ANO', 'SUO', 'cadet'), ctrl.getCadet);
router.put('/:id', requireRole('ANO', 'SUO'), upload.single('photo'), ctrl.updateCadet);
router.delete('/:id', requireRole('ANO'), ctrl.deleteCadet);

module.exports = router;
