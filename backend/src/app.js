import express from 'express';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';
import stockRoutes from './routes/stock.routes.js';
import changeRoutes from './routes/change.routes.js';
import aiRoutes from './routes/ai.routes.js';
import alertRoutes from './routes/alert.routes.js';
import demoRoutes from './routes/demo.routes.js';

export const app = express();

// Security and utility middlewares
app.use(cors({
  origin: '*', // Allow Vite dev server and local clients
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'FinSmart API',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/changes', changeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/demo', demoRoutes);

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.originalUrl} not found`, code: 'NOT_FOUND' }
  });
});

// Centralized error handling
app.use(errorHandler);
