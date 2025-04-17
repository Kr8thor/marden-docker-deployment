import jobQueue from '../queue/job-queue.js';
import Crawler from '../../utils/crawler.js';
import seoAnalyzer from '../../analyzers/index.js';
import reportGenerator from '../../reporters/report-generator.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

/**
 * Worker service for processing audit jobs
 */
class AuditWorker {
  constructor() {
    this.isRunning = false;
    this.currentJobs = new Map();
    this.interval = null;
  }
  
  /**
   * Start the worker service
   * @returns {Promise<void>}
   */
  async start() {
    if (this.isRunning) {
      logger.warn('Worker is already running');
      return;
    }
    
    this.isRunning = true;
    
    logger.info('Starting SEO audit worker service', {
      interval: config.queue.processingInterval,
      batchSize: config.queue.batchSize,
    });
    
    // Set up periodic job processing
    this.interval = setInterval(
      () => this.processNextBatch(),
      config.queue.processingInterval
    );
    
    // Process jobs immediately on startup
    await this.processNextBatch();
  }
  
  /**
   * Stop the worker service
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }
    
    logger.info('Stopping SEO audit worker service');
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.isRunning = false;
    
    // Wait for any current jobs to finish
    const runningJobs = Array.from(this.currentJobs.values());
    
    if (runningJobs.length > 0) {
      logger.info(`Waiting for ${runningJobs.length} job(s) to complete`);
      await Promise.allSettled(runningJobs);
    }
    
    logger.info('SEO audit worker service stopped');
  }
  
  /**
   * Process the next batch of jobs from the queue
   * @returns {Promise<void>}
   */
  async processNextBatch() {
    try {
      if (!this.isRunning) {
        return;
      }
      
      // Calculate how many new jobs we can take based on current capacity
      const availableSlots = config.queue.batchSize - this.currentJobs.size;
      
      if (availableSlots <= 0) {
        logger.debug('Worker is at capacity, skipping job fetch');
        return;
      }
      
      // Get next batch of jobs
      const jobIds = await jobQueue.getNextBatch(availableSlots);
      
      if (jobIds.length === 0) {
        logger.debug('No jobs in queue');
        return;
      }
      
      logger.info(`Processing ${jobIds.length} job(s)`, { jobIds });
      
      // Process each job in parallel
      for (const jobId of jobIds) {
        // Set a timeout to prevent jobs from hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Job ${jobId} timed out after ${config.queue.jobTimeout}ms`));
          }, config.queue.jobTimeout);
        });
        
        // Process the job
        const jobPromise = this.processJob(jobId).catch(error => {
          logger.error(`Job ${jobId} failed:`, error);
          return jobQueue.failJob(jobId, error);
        });
        
        // Track the job with timeout
        const promise = Promise.race([jobPromise, timeoutPromise])
          .finally(() => {
            // Remove job from tracking once completed
            this.currentJobs.delete(jobId);
          });
        
        this.currentJobs.set(jobId, promise);
      }
    } catch (error) {
      logger.error('Error in job batch processing:', error);
    }
  }
  
  /**
   * Process a single audit job
   * @param {string} jobId - Job ID to process
   * @returns {Promise<void>}
   */
  async processJob(jobId) {
    logger.info(`Starting processing of job ${jobId}`);
    
    try {
      // Get job details
      const job = await jobQueue.getJob(jobId);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }
      
      // Update status to processing
      await jobQueue.updateJob(jobId, {
        status: 'processing',
        started: Date.now(),
      });
      
      // Process based on job type
      if (job.type === 'site_audit') {
        await this.processSiteAudit(job);
      } else if (job.type === 'page_audit') {
        await this.processPageAudit(job);
      } else {
        throw new Error(`Unknown job type: ${job.type}`);
      }
      
      logger.info(`Job ${jobId} completed successfully`);
    } catch (error) {
      logger.error(`Error processing job ${jobId}:`, error);
      await jobQueue.failJob(jobId, error);
      
      // Remove from processing queue
      await jobQueue.removeFromProcessing(jobId);
      
      throw error;
    }
  }
  
  /**
   * Process a site-wide audit job
   * @param {Object} job - Job details
   * @returns {Promise<void>}
   */
  async processSiteAudit(job) {
    const { url, options = {} } = job.params;
    
    // Update job with progress
    await jobQueue.updateJob(job.id, {
      progress: 10,
      message: 'Starting site crawl',
    });
    
    // Initialize crawler
    const crawler = new Crawler({
      maxPages: options.maxPages || config.crawler.maxPages,
      depth: options.depth || config.crawler.depth,
      timeout: options.timeout || config.crawler.timeout,
      userAgent: options.userAgent || config.crawler.userAgent,
      followRedirects: options.followRedirects !== false,
      ignoreRobotsTxt: options.ignoreRobotsTxt || false,
    });
    
    // Crawl the site
    const crawlResults = await crawler.crawl(url);
    
    // Update job with progress
    await jobQueue.updateJob(job.id, {
      progress: 40,
      message: `Crawl completed, analyzing ${Object.keys(crawlResults.pages).length} pages`,
    });
    
    // Analyze the crawl results
    const analysisResults = await seoAnalyzer.analyzeSite(crawlResults, options);
    
    // Update job with progress
    await jobQueue.updateJob(job.id, {
      progress: 80,
      message: 'Analysis complete, generating report',
    });
    
    // Generate report
    const report = reportGenerator.generateReport(analysisResults, {
      id: job.id,
      includeDetails: options.includeDetails !== false,
    });
    
    // Complete the job with results
    await jobQueue.completeJob(job.id, {
      report,
      stats: {
        pagesScanned: crawlResults.pagesVisited,
        crawlDuration: crawlResults.duration,
        analysisTimestamp: analysisResults.timestamp,
      },
    });
    
    // Remove from processing queue
    await jobQueue.removeFromProcessing(job.id);
  }
  
  /**
   * Process a single page audit job
   * @param {Object} job - Job details
   * @returns {Promise<void>}
   */
  async processPageAudit(job) {
    const { url, options = {} } = job.params;
    
    // Update job with progress
    await jobQueue.updateJob(job.id, {
      progress: 10,
      message: 'Starting page analysis',
    });
    
    // Initialize crawler (with depth 0 to get only the page)
    const crawler = new Crawler({
      maxPages: 1,
      depth: 0,
      timeout: options.timeout || config.crawler.timeout,
      userAgent: options.userAgent || config.crawler.userAgent,
      followRedirects: options.followRedirects !== false,
    });
    
    // Crawl the single page
    const crawlResults = await crawler.crawl(url);
    
    // Update job with progress
    await jobQueue.updateJob(job.id, {
      progress: 50,
      message: 'Page crawled, analyzing content',
    });
    
    // Get the single page data
    const pageKeys = Object.keys(crawlResults.pages);
    
    if (pageKeys.length === 0) {
      throw new Error(`Failed to crawl page: ${url}`);
    }
    
    const pageData = crawlResults.pages[pageKeys[0]];
    
    // Analyze the page
    const analysisResults = await seoAnalyzer.analyzePage(pageData, options);
    
    // Update job with progress
    await jobQueue.updateJob(job.id, {
      progress: 80,
      message: 'Analysis complete, generating report',
    });
    
    // Complete the job with results
    await jobQueue.completeJob(job.id, {
      analysis: analysisResults,
      stats: {
        crawlDuration: crawlResults.duration,
        analysisTimestamp: analysisResults.timestamp,
      },
    });
    
    // Remove from processing queue
    await jobQueue.removeFromProcessing(job.id);
  }
}

// Create and start the worker when this module is run directly
if (import.meta.url === import.meta.main) {
  const worker = new AuditWorker();
  
  // Handle shutdown signals
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await worker.stop();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await worker.stop();
    process.exit(0);
  });
  
  // Start worker
  worker.start().catch(error => {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  });
}

export default AuditWorker;
