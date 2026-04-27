/**
 * Achievement Routes
 */

const express = require('express');
const router  = express.Router();

const {
  getCadetAchievements,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  getRecentAchievements,
} = require('../controllers/achievementController');

const { protect }     = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/recent',           getRecentAchievements);               // Public
router.get('/cadet/:cadetId',   getCadetAchievements);                // Public
router.post('/',                protect, requireRole('ANO'), addAchievement);
router.put('/:id',              protect, requireRole('ANO'), updateAchievement);
router.delete('/:id',           protect, requireRole('ANO'), deleteAchievement);

module.exports = router;
