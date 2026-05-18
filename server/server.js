require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    console.log('⚠️ Server running in restricted/bypass mode');
  }
  app.listen(PORT, () => {
    console.log(`\n✅ PRAHAR backend running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📧 Test ANO: ano@lcit.edu.in / ano@lcit2024`);
    console.log(`🔐 God Mode: /yt-command\n`);
  });
};

start();
