const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const upload = require('../middleware/upload');

// Public route to get events (for public gallery/events pages)
router.get('/public', ctrl.getPublicEvents);
router.get('/:id/public', ctrl.getPublicEventById);

router.use(protect);

router.get('/', ctrl.getEvents);
// Create event with optional cover image
router.post('/', requireRole('ANO', 'SUO'), upload.single('coverImage'), ctrl.createEvent);
router.put('/:id', requireRole('ANO', 'SUO'), upload.single('coverImage'), ctrl.updateEvent);
router.delete('/:id', requireRole('ANO'), ctrl.deleteEvent);

// Gallery photo management for an event
router.post('/:id/gallery', requireRole('ANO', 'SUO'), upload.array('photos', 10), ctrl.uploadGalleryPhotos);
router.delete('/:id/gallery/:photoId', requireRole('ANO', 'SUO'), ctrl.deleteGalleryPhoto);

module.exports = router;
