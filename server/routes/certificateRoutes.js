const router = require('express').Router();
const ctrl = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', ctrl.getCertificates);
router.post('/', upload.single('file'), ctrl.createCertificate);
router.put('/:id/verify', requireRole('ANO'), ctrl.verifyCertificate);
router.delete('/:id', requireRole('ANO'), ctrl.deleteCertificate);

module.exports = router;
