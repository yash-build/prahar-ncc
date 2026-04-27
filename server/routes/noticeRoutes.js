/**
 * Notice Routes
 * GET /api/notices       — Public (active notices)
 * POST /api/notices      — Private (ANO or SUO can create)
 * PUT /api/notices/:id   — Private (ANO only)
 * DELETE /api/notices/:id — Private (ANO only)
 */

const express = require('express');
const router  = express.Router();

const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');

const { protect }     = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/',       getNotices);
router.post('/',      protect, createNotice);                       // ANO + SUO
router.put('/:id',    protect, requireRole('ANO'), updateNotice);   // ANO only
router.delete('/:id', protect, requireRole('ANO'), deleteNotice);   // ANO only

module.exports = router;
