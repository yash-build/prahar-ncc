const express = require('express');
const router  = express.Router();
const {
  getCadets, getCadet, createCadet, updateCadet, deleteCadet,
  toggleHonor, updateMessage, getDefaulters,
} = require('../controllers/cadetController');
const { protect }     = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { upload }      = require('../config/cloudinary');

// Public routes
router.get('/',              getCadets);
router.get('/defaulters',    protect, getDefaulters);
router.get('/:id',           getCadet);

// Protected routes
router.post('/',             protect, requireRole('ANO'), upload.single('photo'), createCadet);
router.put('/:id',           protect, requireRole('ANO'), upload.single('photo'), updateCadet);
router.delete('/:id',        protect, requireRole('ANO'), deleteCadet);
router.patch('/:id/honor',   protect, requireRole('ANO'), toggleHonor);
router.patch('/:id/message', protect, requireRole('ANO'), updateMessage);

module.exports = router;
