import { nanoid } from 'nanoid';
import config from '../../config/index.js';
import kvStore from '../storage/kv-store.js';
import logger from '../../utils/logger.js';

const { jobPrefix, queueKey, processingQueueKey } = config.keys;

/**
 * Job Queue service for managing audit jobs
 */
const jobQueue = {
  /**
   * Create a new job and add it to the queue
   * @param {Object} jobData - Job configuration and parameters
   * @returns {Promise<string>} Job ID
   */
  async createJob(jobData) {
    try {
      // Generate a unique job ID
      const jobId = jobData.id || nanoid();
      const jobKey = `${jobPrefix}${jobId}`;
      
      // Create job object
      const job = {
        id: jobId,
        status: 'queued',
        progress: 0,
        created: Date.now(),
        updated: Date.now(),
        ...jobData,
      };
      
      // Save the job data
      await kvStore.set(jobKey, job);
      
      // Add the job ID to the queue
      await kvStore.pushToListEnd(queueKey, jobId);
      
      logger.info(`Created new job ${jobId}`, { jobId });
      
      return jobId;
    } catch (error) {
      logger.error('Error creating job:', error);
      throw error;
    }
  },
  
  /**
   * Get job details by ID
   * @param {string} jobId - The job ID
   * @returns {Promise<Object|null>} Job details or null if not found
   */
  async getJob(jobId) {
    try {
      const jobKey = `${jobPrefix}${jobId}`;
      const job = await kvStore.get(jobKey);
      
      return job;
    } catch (error) {
      logger.error(`Error getting job ${jobId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a job's data
   * @param {string} jobId - The job ID
   * @param {Object} updateData - New job data to merge
   * @returns {Promise<Object>} Updated job
   */
  async updateJob(jobId, updateData) {
    try {
      const jobKey = `${jobPrefix}${jobId}`;
      const job = await kvStore.get(jobKey);
      
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }
      
      // Update job with new data
      const updatedJob = {
        ...job,
        ...updateData,
        updated: Date.now(),
      };
      
      await kvStore.set(jobKey, updatedJob);
      
      logger.debug(`Updated job ${jobId}`, { jobId, updateData });
      
      return updatedJob;
    } catch (error) {
      logger.error(`Error updating job ${jobId}:`, error);
      throw error;
    }
  },
  
  /**
   * Mark a job as completed with results
   * @param {string} jobId - The job ID
   * @param {Object} results - Results data
   * @returns {Promise<Object>} Updated job
   */
  async completeJob(jobId, results) {
    try {
      return await this.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        results,
        completed: Date.now(),
      });
    } catch (error) {
      logger.error(`Error completing job ${jobId}:`, error);
      throw error;
    }
  },
  
  /**
   * Mark a job as failed with error details
   * @param {string} jobId - The job ID
   * @param {string|Object} error - Error details
   * @returns {Promise<Object>} Updated job
   */
  async failJob(jobId, error) {
    try {
      const errorData = typeof error === 'string' 
        ? { message: error }
        : { message: error.message, stack: error.stack };
      
      return await this.updateJob(jobId, {
        status: 'failed',
        error: errorData,
        completed: Date.now(),
      });
    } catch (err) {
      logger.error(`Error marking job ${jobId} as failed:`, err);
      throw err;
    }
  },
  
  /**
   * Get next batch of jobs from the queue
   * @param {number} batchSize - Number of jobs to get
   * @returns {Promise<Array<string>>} Array of job IDs
   */
  async getNextBatch(batchSize = config.queue.batchSize) {
    try {
      // Move jobs from queue to processing queue
      const jobIds = [];
      
      for (let i = 0; i < batchSize; i++) {
        const jobId = await kvStore.popFromListStart(queueKey);
        
        if (!jobId) break; // No more jobs in queue
        
        // Add to processing queue
        await kvStore.pushToListEnd(processingQueueKey, jobId);
        
        // Update job status
        const jobKey = `${jobPrefix}${jobId}`;
        const job = await kvStore.get(jobKey);
        
        if (job) {
          await kvStore.set(jobKey, {
            ...job,
            status: 'processing',
            updated: Date.now(),
          });
        }
        
        jobIds.push(jobId);
      }
      
      if (jobIds.length > 0) {
        logger.debug(`Got ${jobIds.length} jobs from queue`, { jobIds });
      }
      
      return jobIds;
    } catch (error) {
      logger.error('Error getting next batch of jobs:', error);
      throw error;
    }
  },
  
  /**
   * Remove a job from the processing queue
   * @param {string} jobId - The job ID to remove
   * @returns {Promise<void>}
   */
  async removeFromProcessing(jobId) {
    try {
      // For simplicity, we'll just get all elements, filter, and set back
      // In a real Redis implementation, this would use more efficient commands
      const processing = await kvStore.getListRange(processingQueueKey, 0, -1);
      
      if (processing && processing.includes(jobId)) {
        // Clear the processing queue
        while (await kvStore.getListLength(processingQueueKey) > 0) {
          await kvStore.popFromListStart(processingQueueKey);
        }
        
        // Push back all jobs except the one we're removing
        const filtered = processing.filter(id => id !== jobId);
        if (filtered.length > 0) {
          await kvStore.pushToListEnd(processingQueueKey, ...filtered);
        }
        
        logger.debug(`Removed job ${jobId} from processing queue`);
      }
    } catch (error) {
      logger.error(`Error removing job ${jobId} from processing queue:`, error);
      throw error;
    }
  },
  
  /**
   * Get queue statistics
   * @returns {Promise<Object>} Queue stats
   */
  async getStats() {
    try {
      const queueLength = await kvStore.getListLength(queueKey);
      const processingLength = await kvStore.getListLength(processingQueueKey);
      
      // Count jobs by status
      const statusCounts = {
        queued: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      };
      
      // Get all job keys
      const jobKeys = await kvStore.scanKeys(`${jobPrefix}*`);
      
      // Count by status
      for (const key of jobKeys) {
        const job = await kvStore.get(key);
        if (job && job.status) {
          statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
        }
      }
      
      return {
        queue: {
          waiting: queueLength,
          processing: processingLength,
          total: queueLength + processingLength,
        },
        jobs: statusCounts,
        totalJobs: jobKeys.length,
      };
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      throw error;
    }
  },
};

export default jobQueue;
