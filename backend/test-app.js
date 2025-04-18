// test-app.js - A simplified Express app to test deployment
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Basic routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    env: process.env.NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
