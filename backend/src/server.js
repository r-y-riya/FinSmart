import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { seedInitialData } from './scripts/seed.js';
import { StockSnapshot } from './models/StockSnapshot.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDatabase();

    // 2. Check if baseline data exists, seed if first run
    const count = await StockSnapshot.countDocuments();
    if (count === 0) {
      logger.info('[Server] No snapshots found in database. Seeding initial baseline...');
      await seedInitialData();
    }

    // 3. Start Express HTTP Server
    const server = app.listen(env.PORT, () => {
      logger.info(`[Server] FinSmart Backend running on port ${env.PORT} (http://localhost:${env.PORT})`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      logger.info('[Server] Shutting down gracefully...');
      server.close(() => {
        logger.info('[Server] Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error(`[Server Fatal] Failed to launch server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
