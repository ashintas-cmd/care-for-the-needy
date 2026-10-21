const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.backend') });

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { initializeFirebase } = require('./utils/firebase');
const trialRoutes = require('./routes/trials');
const authRoutes = require('./routes/auth');
const syncRoutes = require('./routes/sync');
const reportRoutes = require('./routes/reports');
const alertRoutes = require('./routes/alerts');
const queryRoutes = require('./routes/queries');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

// Initialize Firebase
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://care-for-the-needy-patients.web.app', 'https://care-for-the-needy-patients.firebaseapp.com']
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/trials', trialRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/queries', queryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Automated CTRI ingestion remains deliberately disabled until source-use
// permissions, attribution, and a reliable approved data feed are confirmed.
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
