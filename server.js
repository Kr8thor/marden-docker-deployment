// Combined server for frontend and backend
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = process.env.PORT || 3000;

// Add health check endpoint first
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/ready', (req, res) => {
  res.status(200).send('Ready');
});

// Serve frontend static files
console.log('Setting up static file serving...');
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Set up backend service
console.log('Setting up backend service...');
let backendReady = false;
let backendPort = 3001;

// Start backend process
try {
  console.log('Starting backend process...');
  
  // Set any environment variables the backend needs
  const env = {
    ...process.env,
    PORT: backendPort,
    NODE_ENV: 'production'
  };
  
  const backend = spawn('node', ['backend/src/index.js'], { env });
  
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Backend: ${output}`);
    if (output.includes('Server running')) {
      backendReady = true;
      console.log('Backend is ready');
    }
  });
  
  backend.stderr.on('data', (data) => {
    console.error(`Backend error: ${data.toString()}`);
  });
  
  backend.on('error', (err) => {
    console.error('Failed to start backend process:', err);
  });
  
  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    backendReady = false;
  });
  
  // Simple proxy middleware for API requests
  app.use('/api', (req, res, next) => {
    if (!backendReady) {
      return res.status(503).json({ error: 'Backend service is not ready' });
    }
    // Forward to the next handler
    next();
  }, createProxyMiddleware({
    target: `http://localhost:${backendPort}`,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/'
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Backend service unavailable' });
    }
  }));
  
} catch (error) {
  console.error('Error setting up backend:', error);
}

// Handle SPA routing - must be after API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  // Check if requesting a file with extension (like .js, .css)
  if (path.extname(req.path) !== '') {
    // File doesn't exist, return 404
    return res.status(404).send('Not found');
  }
  // Otherwise, assume it's a frontend route and serve the SPA
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Something broke!');
});

// Start server
const server = app.listen(port, () => {
  console.log(`Combined server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
