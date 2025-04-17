/**
 * Types for API responses
 */

// Job statuses
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

// API response for job creation
export interface JobCreationResponse {
  status: 'ok' | 'error';
  message: string;
  jobId: string;
  url: string;
}

// API response for job status
export interface JobStatusResponse {
  status: 'ok' | 'error';
  job: {
    id: string;
    status: JobStatus;
    progress: number;
    created: number;
    updated: number;
    hasResults: boolean;
    error?: {
      message: string;
      stack?: string;
    };
    type: 'site_audit' | 'page_audit';
    params: {
      url: string;
      options: any;
    };
  };
}

// Performance metrics
export interface PerformanceMetrics {
  ttfb?: number;
  domContentLoaded?: number;
  domComplete?: number;
  load?: number;
}

// Issue
export interface Issue {
  type: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  category: 'meta' | 'content' | 'technical' | 'general';
  details?: any;
}

// Recommendation
export interface Recommendation {
  type: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  category: 'meta' | 'content' | 'technical' | 'general';
  details?: string;
  count?: number;
  pages?: string[];
  affectedPages?: number;
  examplePages?: string[];
}

// Scores
export interface ScoreData {
  overall: number;
  meta: number;
  content: number;
  technical: number;
}

// Page analysis result
export interface PageAnalysisResult {
  url: string;
  timestamp: string;
  scores: ScoreData;
  issues: Issue[];
  issueCount: number;
  recommendations: Recommendation[];
  categories: {
    meta: any;
    content: any;
    technical: any;
  };
}

// Site analysis result
export interface SiteAnalysisResult {
  baseUrl: string;
  timestamp: string;
  crawlStats: {
    pagesVisited: number;
    crawlDuration: number;
  };
  scores: ScoreData;
  totalIssues: number;
  issueTypeCounts: Record<string, number>;
  topIssues: Array<{
    type: string;
    count: number;
  }>;
  recommendations: Recommendation[];
  pages: Record<string, PageAnalysisResult | { skipped: boolean; reason: string }>;
}

// API response for job results
export interface JobResultsResponse {
  status: 'ok' | 'error';
  jobId: string;
  completed: number;
  results: {
    report?: SiteAnalysisResult;
    analysis?: PageAnalysisResult;
    stats: {
      pagesScanned?: number;
      crawlDuration: number;
      analysisTimestamp: string;
    };
  };
}

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  environment: string;
  message: string;
}