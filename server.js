// Simple combined server for Railway deployment
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Basic health check that responds immediately
app.get('/health', (req, res) => {
  console.log('Health check request received');
  res.status(200).send('OK');
});

app.get('/ready', (req, res) => {
  console.log('Ready check request received');
  res.status(200).send('Ready');
});

// Root path
app.get('/', (req, res) => {
  console.log('Root path request received');
  res.send('Marden Docker Deployment is running');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
