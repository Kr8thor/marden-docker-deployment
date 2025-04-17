/**
 * API Client for interacting with the Marden SEO Audit backend
 */
import {
  JobCreationResponse,
  JobStatusResponse,
  JobResultsResponse,
  HealthCheckResponse
} from './types';

// Backend API URL - will use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * API client for the Marden SEO Audit service
 */
const apiClient = {
  /**
   * Submit a URL for site audit
   * @param url URL to audit
   * @param options Additional audit options
   * @returns Promise with job details
   */
  submitSiteAudit: async (url: string, options = {}): Promise<JobCreationResponse> => {
    const response = await fetch(`${API_BASE_URL}/audit/site`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, options }),
    });
    
    return handleResponse<JobCreationResponse>(response);
  },
  
  /**
   * Submit a URL for page audit
   * @param url URL to audit
   * @param options Additional audit options
   * @returns Promise with job details
   */
  submitPageAudit: async (url: string, options = {}): Promise<JobCreationResponse> => {
    const response = await fetch(`${API_BASE_URL}/audit/page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, options }),
    });
    
    return handleResponse<JobCreationResponse>(response);
  },
  
  /**
   * Get status of a job
   * @param jobId Job ID
   * @returns Promise with job status
   */
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/job/${jobId}`);
    return handleResponse<JobStatusResponse>(response);
  },
  
  /**
   * Get results of a completed job
   * @param jobId Job ID
   * @returns Promise with job results
   */
  getJobResults: async (jobId: string): Promise<JobResultsResponse> => {
    const response = await fetch(`${API_BASE_URL}/job/${jobId}/results`);
    return handleResponse<JobResultsResponse>(response);
  },
  
  /**
   * Check API health
   * @returns Promise with health status
   */
  checkHealth: async (): Promise<HealthCheckResponse> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<HealthCheckResponse>(response);
  },
};

export default apiClient;