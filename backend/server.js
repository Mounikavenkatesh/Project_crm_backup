import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import prisma, { connectDB, disconnectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

/**
 * Normalize origin URLs (trim whitespace and trailing slashes) for reliable CORS matching.
 */
const normalizeOrigin = (value) => (value ? value.trim().replace(/\/+$/, '') : '');

/**
 * Validate required runtime environment variables before starting the server.
 */
function checkRequiredEnvVars() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((variable) => !process.env[variable]);

  if (missing.length > 0) {
    console.error(`CRITICAL CONFIG ERROR: Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

checkRequiredEnvVars();

const app = express();
const PORT = process.env.PORT || 5000;

// Render runs behind a reverse proxy; trust the first proxy hop for accurate rate-limiting IPs.
app.set('trust proxy', 1);

// Request Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Security Headers
app.use(helmet());

// Rate Limiting Protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// CORS configuration with normalized origin whitelists
const rawOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
const allowedOrigins = new Set(rawOrigins.map(normalizeOrigin).filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
      message: error.message,
      timestamp: new Date(),
    });
  }
});

// Register App Routes (mounted once per resource prefix)
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Catch-All for Unmatched Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware (MUST be registered last)
app.use(errorHandler);

let httpServer = null;

export const startServer = async () => {
  await connectDB();
  httpServer = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
  return httpServer;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();

  const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
      if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
      }
      await disconnectDB();
      console.log('Prisma database connection closed cleanly.');
      process.exit(0);
    } catch (error) {
      console.error('Error during database connection teardown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
