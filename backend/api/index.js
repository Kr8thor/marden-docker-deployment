const express = require('express');
const app = express();
app.use(express.json());

const { runWorker } = require('../src/worker');

const port = process.env.PORT || 3000;

// Route to /api
app.get('/api', (req, res) => {
  res.json({message:'Marden SEO Audit API'});
});

// Route to /api/health
app.get('/api/health', (req, res) => {
  res.json({status:'ok'});
});

// Route to /api/audit
app.post('/api/audit', (req, res) => {
  res.json({message: "Audit started"});
});

// Route to /api/audit/:jobId
app.get('/api/audit/:jobId', (req, res) => {
  res.json({message: `Job ${req.params.jobId} status`});
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  runWorker();
});



module.exports = app;


module.exports = app;



