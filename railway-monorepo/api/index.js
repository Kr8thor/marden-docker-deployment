// Simple Express server for Railway deployment
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Marden API is running',
    environment: process.env.NODE_ENV
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mock endpoint for SEO audit
app.post('/audit', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      status: 'error',
      message: 'URL is required'
    });
  }
  
  // Create a mock job
  const job = {
    id: Math.random().toString(36).substring(2, 15),
    url,
    status: 'queued',
    createdAt: new Date().toISOString()
  };
  
  res.json({
    status: 'success',
    job
  });
});

// Start the server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
