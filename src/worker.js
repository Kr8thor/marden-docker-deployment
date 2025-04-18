const { default: axios } = require('axios');
const cheerio = require('cheerio');

async function runWorker(jobs, results) {
    console.log("Worker running");
    while (true) {
        if (jobs.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }
        const job = jobs.shift();
        const { jobId, url } = job;
        console.log(`Processing job: ${jobId} - URL: ${url}`);
        try {
            const auditResult = await performAudit(url);
            results[jobId] = auditResult;
            console.log(`Job ${jobId} completed`);
        } catch (error) {
            console.error(`Error processing job ${jobId}:`, error);
            results[jobId] = { status: 'error', error: error.message };
        }
    }
}

async function performAudit(url) {
    try {
        const response = await axios.get(url, {timeout: 10000});
        const $ = cheerio.load(response.data);
        const title = $('title').text() || 'Not found';
        const metaDescription = $('meta[name="description"]').attr('content') || 'Not found';
        const h1 = $('h1').first().text() || 'Not found';
        return {
            status: 'complete',
            title,
            metaDescription,
            h1
        };
    } catch (error) {
        console.error(`Error during audit of ${url}:`, error);
        return {
            status: 'error',
            error: error.message
        };
    }
}

module.exports = { runWorker };