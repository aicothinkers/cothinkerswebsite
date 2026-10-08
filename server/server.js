const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const speakerRoutes = require('./routes/speakerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const contentRoutes = require('./routes/contentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');
const jobRoutes = require('./routes/jobRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// ==========================================
// THE FIX: Increased Payload Limits
// These MUST be declared right here before the routes!
// ==========================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// API Foundation Test Route
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'BacktoBase API is running successfully',
      environment: process.env.NODE_ENV,
      timestamp: new Date()
    }
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/speakers', speakerRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/community', subscriberRoutes);
app.use('/api/v1/attendees', attendeeRoutes);
app.use('/api/v1/jobs', jobRoutes);
// Global Error Handler Fallback
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});
// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve React's index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));