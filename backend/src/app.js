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

// Root endpoint: displays status and one-click navigation to the frontend web app
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FinSmart API Server</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAFAF7;
            color: #17212B;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            border: 1px solid #E8E9EE;
            max-width: 500px;
            text-align: center;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            background: rgba(22, 166, 106, 0.12);
            color: #16A66A;
            border-radius: 100px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          .badge-dot {
            width: 8px;
            height: 8px;
            background: #16A66A;
            border-radius: 50%;
            display: inline-block;
          }
          h1 {
            font-size: 22px;
            margin: 0 0 10px 0;
            font-weight: 700;
          }
          p {
            color: #66727D;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 28px 0;
          }
          .btn {
            display: inline-block;
            background: #16A66A;
            color: white;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            transition: background 0.2s;
          }
          .btn:hover {
            background: #138E5B;
          }
          .endpoints {
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid #E8E9EE;
            font-size: 12px;
            color: #8C96A3;
            text-align: left;
          }
          .endpoints code {
            color: #5B9CF6;
            background: #F4F6FB;
            padding: 2px 6px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <span class="badge-dot"></span>
            FinSmart API Active
          </div>
          <h1>Backend Server is Running</h1>
          <p>You have reached the FinSmart Express API backend. The interactive web application is running at <strong>http://localhost:5173</strong>.</p>
          <a href="http://localhost:5173" class="btn">Open FinSmart Web App &rarr;</a>
          <div class="endpoints">
            <strong>Key Endpoints:</strong><br>
            • Health: <code>/api/health</code><br>
            • Watchlist: <code>/api/watchlist</code><br>
            • Changes: <code>/api/changes/since-last-visit</code><br>
            • AI Intelligence: <code>/api/ai/ask</code>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  res.json({
    service: 'FinSmart API',
    status: 'HEALTHY',
    version: '1.0.0',
    webAppUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      watchlist: '/api/watchlist',
      stocks: '/api/stocks',
      changes: '/api/changes',
      ai: '/api/ai'
    }
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
