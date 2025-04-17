import express from 'express';
import routes from './routes.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Initialize API server
 * @returns {Object} Express app
 */
function createServer() {
  const app = express();
  
  // Middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.debug(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      });
    });
    
    next();
  });
  
  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      return res.status(204).end();
    }
    
    next();
  });
  
  // Base path for API
  app.use('/api', routes);
  
  // Root path for health check
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Marden SEO Audit API',
      version: process.env.npm_package_version || '1.0.0',
      status: 'running',
    });
  });
  
  // Handle 404s
  app.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: `Not found: ${req.originalUrl}`,
    });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    logger.error('Express error:', err);
    
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
      ...(config.server.env === 'development' && { stack: err.stack }),
    });
  });
  
  return app;
}

export default createServer;
