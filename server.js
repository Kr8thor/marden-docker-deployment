// Combined server for frontend and backend
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

// Start backend process
console.log('Starting backend process...');
const backend = spawn('node', ['backend/src/index.js']);

backend.stdout.on('data', (data) => {
  console.log(`Backend: ${data}`);
});

backend.stderr.on('data', (data) => {
  console.error(`Backend error: ${data}`);
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Proxy API requests to backend
app.use('/api', (req, res, next) => {
  // This should be replaced with proper proxy middleware
  // For simplicity, we're manually forwarding to the backend
  res.send('API endpoint - proxying to backend');
});

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Combined server running on port ${port}`);
});