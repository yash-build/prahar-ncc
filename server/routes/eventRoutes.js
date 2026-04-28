const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.use(protect);

router.get('/', ctrl.getEvents);
router.post('/', requireRole('ANO', 'SUO'), ctrl.createEvent);
router.put('/:id', requireRole('ANO', 'SUO'), ctrl.updateEvent);
router.delete('/:id', requireRole('ANO'), ctrl.deleteEvent);

module.exports = router;
