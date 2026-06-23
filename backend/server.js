const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// PostgreSQL Database imports
const { pool, query } = require('./db/pg');
const { createTables } = require('./db/seedDatabase');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const queueRoutes = require('./routes/queues');
const appointmentRoutes = require('./routes/appointments');
const medicalRecordsRoutes = require('./routes/medicalRecords');
const inventoryRoutes = require('./routes/inventory');
const billingRoutes = require('./routes/billing');
const financeRoutes = require('./routes/finance');
const usersRoutes = require('./routes/users');
const reportsRoutes = require('./routes/reports');
const ticketRoutes = require('./routes/tickets');
const prescriptionRoutes = require('./routes/prescriptions');
const pharmacyOpsRoutes = require('./routes/pharmacyOps');
const createModuleRouter = require('./routes/genericModuleRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
});
app.use('/api/', limiter);

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize PostgreSQL database tables
const initializeDatabase = async () => {
  try {
    // Test connection
    await query('SELECT NOW()');
    console.log('✓ PostgreSQL database connected successfully');
    
    // Create tables if they don't exist
    await createTables();
    console.log('✓ Database tables initialized');
  } catch (err) {
    console.error('✗ Database initialization error:', err.message);
    console.error('Please ensure PostgreSQL is running at:', process.env.DATABASE_URL);
    // Don't exit - allow server to run for testing
  }
};

// Initialize database on startup
initializeDatabase();

// Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/pharmacy-ops', pharmacyOpsRoutes);

// Postgres-backed generic module routes
app.use('/api/emergency', createModuleRouter('emergency'));
app.use('/api/triage', createModuleRouter('triage'));
app.use('/api/doctor', createModuleRouter('doctor'));
app.use('/api/laboratory', createModuleRouter('laboratory'));
app.use('/api/radiology', createModuleRouter('radiology'));
app.use('/api/pharmacy', createModuleRouter('pharmacy'));
app.use('/api/inpatient', createModuleRouter('inpatient'));
app.use('/api/theatre', createModuleRouter('theatre'));
app.use('/api/blood-bank', createModuleRouter('blood-bank'));
app.use('/api/cssd', createModuleRouter('cssd'));
app.use('/api/nutrition', createModuleRouter('nutrition'));
app.use('/api/telemedicine', createModuleRouter('telemedicine'));
app.use('/api/mortuary', createModuleRouter('mortuary'));
app.use('/api/procurement', createModuleRouter('procurement'));
app.use('/api/hr', createModuleRouter('hr'));
app.use('/api/messaging', createModuleRouter('messaging'));
app.use('/api/it', createModuleRouter('it'));
app.use('/api/admin', createModuleRouter('admin'));
app.use('/api/super-admin', createModuleRouter('super-admin'));
app.use('/api/dashboard', createModuleRouter('dashboard'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'iCare HMIS API is running',
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;