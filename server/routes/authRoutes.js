// ─────────────────────────────────────────────
// routes/authRoutes.js
// ─────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const { login, register, getMe, listUsers, toggleUser } = require('../controllers/authController');
const { protect }      = require('../middleware/authMiddleware');
const { requireRole }  = require('../middleware/roleMiddleware');

router.post('/login',                         login);
router.post('/register', protect, requireRole('ANO'), register);
router.get('/me',        protect,             getMe);
router.get('/users',     protect, requireRole('ANO'), listUsers);
router.patch('/users/:id/toggle', protect, requireRole('ANO'), toggleUser);

module.exports = router;
