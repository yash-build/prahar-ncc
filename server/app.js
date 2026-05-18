const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
      'https://prahar-ncc.vercel.app',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-yt-secret'],
}));

app.options('*', cors()); // preflight

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({
    status:    'OK',
    system:    'PRAHAR',
    unit:      '17 CG BN NCC — LCIT College Bilaspur',
    builtBy:   'Yash Tiwari',
    timestamp: new Date().toISOString(),
  });
});

// Routes — each file MUST export single router only
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/cadets',        require('./routes/cadetRoutes'));
app.use('/api/attendance',    require('./routes/attendanceRoutes'));
app.use('/api/notices',       require('./routes/noticeRoutes'));
app.use('/api/achievements',  require('./routes/achievementRoutes'));
app.use('/api/gallery',       require('./routes/galleryRoutes'));
app.use('/api/events',        require('./routes/eventRoutes'));
app.use('/api/certificates',  require('./routes/certificateRoutes'));
app.use('/api/reports',       require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/batch',         require('./routes/batchRoutes'));
app.use('/api/unit',          require('./routes/unitRoutes'));
app.use('/api/audit',         require('./routes/auditRoutes'));
app.use('/api/yt',            require('./routes/ytRoutes'));
app.use('/api/settings',      require('./routes/settingsRoutes'));

app.use(require('./middleware/notFound'));
app.use(require('./middleware/errorHandler'));

module.exports = app;
