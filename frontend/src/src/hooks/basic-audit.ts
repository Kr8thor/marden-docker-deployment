// Extremely simple hook for SEO audit
import { useState } from 'react';

export interface AuditResult {
  url: string;
  score: number;
  issuesFound: number;
  opportunities: number;
  performanceMetrics: {
    lcp: {
      value: number;
      unit: string;
      score: number;
    };
    cls: {
      value: number;
      score: number;
    };
    fid: {
      value: number;
      unit: string;
      score: number;
    };
  };
  topIssues: any[];
  pageAnalysis?: any;
}

export function useBasicAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Simple function to run an audit - COMPLETELY REWRITTEN FOR RELIABILITY
  const runAudit = async (url: string) => {
    try {
      // Reset state
      setIsLoading(true);
      setProgress(0);
      setError(null);
      
      // Simulate progress visually, but clear this later
      const interval = setInterval(() => {
        setProgress(prev => Math.min(95, prev + Math.random() * 5));
      }, 300);
      
      // Clean the URL
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      // CRITICAL CHANGE: Use the direct crawler endpoint with no fallbacks
      const encodedUrl = encodeURIComponent(cleanUrl);
      const apiUrl = `/api/direct-crawler?url=${encodedUrl}`;
      
      console.log('>>> DIRECT CALL to crawler API:', apiUrl);
      
      // Create a long timeout for the API call
      const fetchPromise = fetch(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Timestamp': new Date().getTime().toString() // Prevent caching
        }
      });
      
      // Set a reasonable timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out after 25 seconds')), 25000);
      });
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      console.log('>>> RECEIVED RESPONSE with status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API returned error status ${response.status}`);
      }
      
      // Parse the real data
      const rawData = await response.text();
      console.log('>>> RAW RESPONSE:', rawData.substring(0, 100) + '...'); // Log the first 100 chars
      
      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error('>>> Failed to parse JSON:', e);
        throw new Error('Invalid JSON response from API');
      }
      
      console.log('>>> PARSED DATA:', data);
      
      // Verify we got real data by checking for our special flag
      if (data.realDataFlag === "THIS_IS_REAL_DATA_NOT_MOCK") {
        console.log('>>> CONFIRMED REAL DATA RECEIVED');
      } else {
        console.log('>>> WARNING: Real data flag not found');
      }
      
      // Complete progress
      clearInterval(interval);
      setProgress(100);
      
      // Update state with the real data
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
      }, 300);
      
    } catch (e) {
      console.error('Error running real audit:', e);
      
      console.log('Attempting to use fallback simple audit...');
      
      // ⚠️ NO FALLBACKS - If the real API fails, we show the error
      clearInterval(interval);
      setProgress(0);
      
      // Provide detailed error message for debugging
      console.error('>>> API ERROR OCCURRED:', e);
      
      const errorMessage = e instanceof Error 
        ? `REAL ERROR: ${e.message}`
        : 'REAL ERROR: Failed to connect to the audit service. Please try again.';
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    progress,
    result,
    error,
    runAudit
  };
}