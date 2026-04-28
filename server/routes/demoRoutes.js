const router  = require('express').Router();
const { protect } = require('../middleware/auth');
const { seedDemo } = require('../controllers/demoController');

// POST /api/demo/seed  — ANO only
router.post('/seed', protect, seedDemo);

module.exports = router;
