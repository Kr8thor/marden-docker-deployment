const { default: axios } = require('axios');
const cheerio = require('cheerio');
async function runWorker(redisClient) {
    console.log("Worker running")
    while (true) {
        try{
            const res = await redisClient.blPop('jobs', 0)
            const job = res.element
            console.log(`Processing job: ${job}`)
            const [jobId, url] = job.split(":");
            const auditResult = await performAudit(url);
            await redisClient.hSet(`results:${jobId}`, auditResult);
            console.log(`Job ${jobId} completed`)
        } catch(error){
            console.error("Worker error:", error);
        }
    }
}

async function performAudit(url){
    try{
        const result = await axios.get(url);
        const $ = cheerio.load(result.data);
        const title = $('title').text()
        return {
            status: 'complete',
            title
        }
    } catch(error){
        return { error: error}
    }
}
module.exports = { runWorker };