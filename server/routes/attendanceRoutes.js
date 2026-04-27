// ─────────────────────────────────────────────
// routes/attendanceRoutes.js
// ─────────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const {
  getSessions, getSession, createSession,
  markAttendance, bulkMark, toggleLock, getCadetAttendance,
} = require('../controllers/attendanceController');
const { protect }     = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/sessions',                   protect, getSessions);
router.get('/sessions/:id',               protect, getSession);
router.post('/sessions',                  protect, createSession);
router.patch('/sessions/:id/mark',        protect, markAttendance);
router.patch('/sessions/:id/bulk',        protect, bulkMark);
router.patch('/sessions/:id/lock',        protect, requireRole('ANO'), toggleLock);
router.get('/cadet/:cadetId',             protect, getCadetAttendance);

module.exports = router;


// ─────────────────────────────────────────────
// routes/noticeRoutes.js
// ─────────────────────────────────────────────
const express2 = require('express');
const router2  = express2.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect: protect2 }     = require('../middleware/authMiddleware');
const { requireRole: requireRole2 } = require('../middleware/roleMiddleware');

router2.get('/',        getNotices);
router2.post('/',       protect2, createNotice);
router2.put('/:id',     protect2, requireRole2('ANO'), updateNotice);
router2.delete('/:id',  protect2, requireRole2('ANO'), deleteNotice);

// Export separately — app.js imports each file individually
// This file has dual export; split into separate files in prod
module.exports = { attendanceRouter: router, noticeRouter: router2 };
