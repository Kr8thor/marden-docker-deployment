// Simple Express API for Vercel deployment
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Marden SEO Audit API',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mock audit endpoint
app.post('/audit', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      status: 'error',
      message: 'URL is required'
    });
  }
  
  // Create a mock job response
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

// Export for Vercel serverless function
module.exports = app;
