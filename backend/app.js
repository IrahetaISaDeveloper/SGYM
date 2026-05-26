import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// CORS — allow the Vercel frontend (set FRONTEND_URL env var in production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://sgym.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

// Routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import accessRoutes from './src/routes/accessRoutes.js';
import machineRoutes from './src/routes/machineRoutes.js';
import planRoutes from './src/routes/planRoutes.js';
import exerciseRoutes from './src/routes/exerciseRoutes.js';
import routineRoutes from './src/routes/routineRoutes.js';
import workoutLogRoutes from './src/routes/workoutLogRoutes.js';
import shiftRoutes from './src/routes/shiftRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/workout-logs', workoutLogRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
