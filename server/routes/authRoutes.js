// ERROR FIX #1: Single router export
const router = require('express').Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', protect, register);
router.get('/me', protect, getMe);

module.exports = router; // Single export — NOT an object
