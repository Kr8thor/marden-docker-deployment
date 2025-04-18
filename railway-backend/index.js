// Basic Express server for Railway deployment
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Marden API is running',
    environment: process.env.NODE_ENV,
    redis_url: process.env.REDIS_URL ? 'Configured' : 'Not configured'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Redis URL: ${process.env.REDIS_URL ? 'Configured' : 'Not configured'}`);
});
