const express = require('express');
const { runWorker } = require('../src/worker');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// In-Memory Job Queue and Results
const jobs = [];
const results = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api', (req, res) => {
    console.log("GET /api");
    res.json({ message: "Marden SEO Audit API" });
});

app.get('/api/health', (req, res) => {
    console.log("GET /api/health");
    res.json({ status: "ok" });
});

app.post('/api/audit', (req, res) => {
    const url = req.body.url;
    console.log(`POST /api/audit - URL: ${url}`);
    if (!url) {
        console.error("Error: No URL provided");
        return res.status(400).json({ error: "No URL provided" });
    }
    const jobId = nanoid();
    const job = { jobId, url };
    jobs.push(job);
    console.log(`Job ${jobId} added to queue`);
    res.json({ message: "Audit started", jobId });
});

app.get('/api/audit/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    console.log(`GET /api/audit/${jobId}`);
    if (!results[jobId]) {
        console.log(`Job ${jobId} pending`);
        return res.json({ status: 'pending' });
    }
    console.log(`Job ${jobId} completed`);
    res.json(results[jobId]);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    runWorker(jobs, results);
});