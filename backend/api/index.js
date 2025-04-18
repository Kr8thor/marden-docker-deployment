const express = require('express');
const { createClient } = require('redis');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());

const { runWorker } = require('../src/worker');

const port = process.env.PORT || 3000;
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379' // Use localhost for local testing
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Route to /api
app.get('/api', (req, res) => {
    console.log('GET /api - Request received');
    res.json({message:'Marden SEO Audit API'});
});

// Route to /api/health
app.get('/api/health', async (req, res) => {
    console.log('GET /api/health - Request received');
    try{
        await redisClient.ping()
        res.json({status:'ok'});
    } catch(error){
        console.error("Redis error:", error);
        res.status(500).json({ error: "Failed to connect to redis" });
    }
});

// Route to /api/audit
app.post('/api/audit', async (req, res) => {
    console.log('POST /api/audit - Request received');
    const jobId = nanoid();
    const url = req.body.url;
    if (!url) {
        console.error("Missing url");
        return res.status(400).json({ error: "Missing url" });
    }
    try {
        await redisClient.rPush("jobs", `${jobId}:${url}`)
        res.json({ message: "Audit started", jobId });
        console.log("Audit started ok:", jobId);
    } catch(error){
        console.error("Redis error:", error);
        res.status(500).json({ error: "Failed to start audit" });
    }
    
});

// Route to /api/audit/:jobId
app.get('/api/audit/:jobId', async (req, res) => {
    console.log(`GET /api/audit/${req.params.jobId} - Request received`);
    const jobId = req.params.jobId;
    try {
        const status = await redisClient.hGetAll(`results:${jobId}`);
        if(Object.keys(status).length === 0) return res.json({status: 'pending'})
        res.json(status);
        console.log("Audit id sent ok:", jobId);
    } catch (error) {
         console.error("Redis error:", error);
         res.status(500).json({ error: "Failed to get audit status" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    runWorker(redisClient);
});



module.exports = app;



