import createServer from './api/index.js';
import config from './config/index.js';
import logger from './utils/logger.js';

/**
 * Start the API server
 */
async function startServer() {
  try {
    const app = createServer();
    
    const server = app.listen(config.server.port, () => {
      logger.info(`Marden SEO Audit API server started`, {
        port: config.server.port,
        env: config.server.env,
      });
    });
    
    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down API server...');
      
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
      
      // Force close after timeout
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server when this file is run directly
if (import.meta.url === import.meta.main) {
  startServer();
}

export default startServer;
