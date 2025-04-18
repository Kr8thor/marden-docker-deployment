const { default: axios } = require('axios');
const cheerio = require('cheerio');

async function runWorker(redisClient) {
  console.log("Worker running");
  while (true) {
    try {
      const res = await redisClient.blPop('jobs', 0);
      const job = res.element;
      console.log(`Processing job: ${job}`);
      const [jobId, url] = job.split(":");
      
      const auditResult = await performAudit(url);
      await redisClient.hSet(`results:${jobId}`, auditResult);
      console.log(`Job ${jobId} completed`);
    } catch (error) {
      console.error("Worker error:", error);
      // Add a delay to avoid busy-looping on errors
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

async function performAudit(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').text();
    return {
      status: 'complete',
      title,
      metaDescription,
      h1,
    };
  } catch (error) {
    console.error(`Audit failed for ${url}:`, error);
    return {
      status: 'error',
      error: error.message,
    };
  }
}

module.exports = {
    runWorker
        }