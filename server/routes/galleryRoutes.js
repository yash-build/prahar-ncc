const router = require('express').Router();
const ctrl = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

router.get('/public', ctrl.getPublicGallery);

router.use(protect);

router.get('/', ctrl.getGallery);
router.post('/', requireRole('ANO', 'SUO'), upload.single('image'), ctrl.createGalleryItem);
router.put('/:id', requireRole('ANO', 'SUO'), ctrl.updateGalleryItem);
router.delete('/:id', requireRole('ANO', 'SUO'), ctrl.deleteGalleryItem);

module.exports = router;
