const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Marden SEO Audit API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mock SEO audit endpoint
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

// Start server
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
