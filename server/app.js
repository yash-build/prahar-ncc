const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes — ERROR FIX #1: Each file exports single router
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/cadets',       require('./routes/cadetRoutes'));
app.use('/api/attendance',   require('./routes/attendanceRoutes'));
app.use('/api/notices',      require('./routes/noticeRoutes'));      // Separate file
app.use('/api/achievements', require('./routes/achievementRoutes'));
app.use('/api/gallery',      require('./routes/galleryRoutes'));
app.use('/api/events',       require('./routes/eventRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/reports',      require('./routes/reportRoutes'));
app.use('/api/batch',        require('./routes/batchRoutes'));
app.use('/api/unit',         require('./routes/unitRoutes'));
app.use('/api/audit',        require('./routes/auditRoutes'));
app.use('/api/demo',         require('./routes/demoRoutes'));  // Demo seed (ANO only)
app.use('/api/yt',           require('./routes/ytRoutes')); // God Mode

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'PRAHAR', timestamp: new Date() });
});

// Error middleware — MUST be last
app.use(require('./middleware/notFound'));
app.use(require('./middleware/errorHandler'));

module.exports = app;
