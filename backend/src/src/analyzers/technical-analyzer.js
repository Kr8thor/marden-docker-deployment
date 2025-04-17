import logger from '../utils/logger.js';

/**
 * Analyzes technical SEO aspects
 */
const technicalAnalyzer = {
  /**
   * Analyze technical SEO aspects
   * @param {Object} page - Page data from crawler
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis results
   */
  analyze(page, options = {}) {
    try {
      const results = {
        issues: [],
        score: 0,
        maxScore: 0,
        recommendations: [],
      };
      
      // Check HTTP status
      this.checkHttpStatus(page, results);
      
      // Check redirects
      this.checkRedirects(page, results);
      
      // Check URL structure
      this.checkUrl(page, results);
      
      // Check page load time
      this.checkPageSpeed(page, results);
      
      // Check mobile friendliness (basic check based on viewport)
      this.checkMobileFriendliness(page, results);
      
      // Calculate score
      results.score = Math.min(
        results.maxScore - results.issues.length,
        results.maxScore
      );
      
      // Calculate percentage
      results.percentage = results.maxScore > 0
        ? Math.round((results.score / results.maxScore) * 100)
        : 100;
      
      logger.debug(`Technical analysis for ${page.url}`, {
        score: results.score,
        maxScore: results.maxScore,
        issues: results.issues.length,
      });
      
      return results;
    } catch (error) {
      logger.error(`Error during technical analysis for ${page.url}:`, error);
      return {
        issues: [{
          type: 'error',
          message: `Error during technical analysis: ${error.message}`,
          impact: 'high',
        }],
        score: 0,
        maxScore: 1,
        percentage: 0,
        recommendations: [],
      };
    }
  },
  
  /**
   * Check HTTP status code
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkHttpStatus(page, results) {
    results.maxScore += 1;
    
    if (!page.statusCode) {
      results.issues.push({
        type: 'unknown_status',
        message: 'Page status code is unknown',
        impact: 'high',
      });
      
      results.recommendations.push({
        type: 'unknown_status',
        message: 'Investigate why the page status code could not be determined',
        impact: 'high',
        details: 'A proper HTTP status code is essential for search engines to understand how to handle the page.',
      });
      
      return;
    }
    
    if (page.statusCode >= 400) {
      results.issues.push({
        type: 'error_status',
        message: `Page returned error status code ${page.statusCode}`,
        impact: 'high',
        details: {
          statusCode: page.statusCode,
        },
      });
      
      results.recommendations.push({
        type: 'error_status',
        message: `Fix the ${page.statusCode} error on this page`,
        impact: 'high',
        details: 'Error pages are not indexed by search engines and create a poor user experience.',
      });
    } else if (page.statusCode >= 300 && page.statusCode < 400) {
      // Redirects are handled in checkRedirects
    } else if (page.statusCode !== 200) {
      results.issues.push({
        type: 'non_standard_status',
        message: `Page returned non-standard status code ${page.statusCode}`,
        impact: 'medium',
        details: {
          statusCode: page.statusCode,
        },
      });
      
      results.recommendations.push({
        type: 'non_standard_status',
        message: `Review why the page is returning status code ${page.statusCode}`,
        impact: 'medium',
        details: 'Non-standard status codes may cause unexpected behavior with search engines.',
      });
    }
  },
  
  /**
   * Check redirects
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkRedirects(page, results) {
    results.maxScore += 1;
    
    if (page.statusCode >= 300 && page.statusCode < 400) {
      results.issues.push({
        type: 'redirect',
        message: `Page is a ${page.statusCode} redirect`,
        impact: 'medium',
        details: {
          statusCode: page.statusCode,
          redirectTo: page.redirect || 'Unknown destination',
        },
      });
      
      results.recommendations.push({
        type: 'redirect',
        message: 'Update internal links to point directly to the destination URL',
        impact: 'medium',
        details: 'Redirects add additional page load time and reduce the SEO value passed to the destination page.',
      });
    }
    
    if (page.redirect && page.statusCode !== 301 && page.statusCode !== 308) {
      results.issues.push({
        type: 'non_permanent_redirect',
        message: `Page uses a temporary redirect (${page.statusCode}) instead of a permanent redirect`,
        impact: 'medium',
        details: {
          statusCode: page.statusCode,
          redirectTo: page.redirect,
        },
      });
      
      results.recommendations.push({
        type: 'non_permanent_redirect',
        message: 'Change temporary redirects to permanent (301) redirects for SEO value',
        impact: 'medium',
        details: 'Permanent redirects (301) pass more SEO value to the destination URL than temporary redirects.',
      });
    }
  },
  
  /**
   * Check URL structure
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkUrl(page, results) {
    results.maxScore += 2;
    
    try {
      const url = new URL(page.url);
      
      // Check URL length (too long URLs are not good for SEO)
      if (page.url.length > 100) {
        results.issues.push({
          type: 'url_too_long',
          message: 'URL is too long',
          impact: 'low',
          details: {
            url: page.url,
            length: page.url.length,
          },
        });
        
        results.recommendations.push({
          type: 'url_too_long',
          message: 'Consider shortening the URL',
          impact: 'low',
          details: 'Shorter URLs are easier to share, remember, and are generally preferred for SEO.',
        });
      }
      
      // Check for URL parameters (can cause duplicate content issues)
      if (url.search && url.search.length > 0) {
        results.issues.push({
          type: 'url_has_parameters',
          message: 'URL contains query parameters',
          impact: 'low',
          details: {
            parameters: url.search,
          },
        });
        
        results.recommendations.push({
          type: 'url_has_parameters',
          message: 'Consider using URL rewriting for cleaner URLs without parameters',
          impact: 'low',
          details: 'URLs with parameters may cause duplicate content issues and are less user-friendly.',
        });
      }
      
      // Check for uppercase letters in URL
      if (/[A-Z]/.test(url.pathname)) {
        results.issues.push({
          type: 'url_uppercase',
          message: 'URL contains uppercase letters',
          impact: 'low',
          details: {
            pathname: url.pathname,
          },
        });
        
        results.recommendations.push({
          type: 'url_uppercase',
          message: 'Convert URLs to lowercase',
          impact: 'low',
          details: 'Mixed-case URLs can create duplicate content issues as some servers treat them as different URLs.',
        });
      }
      
      // Check for special characters in URL
      if (/[^\w\-\./]/.test(url.pathname)) {
        results.issues.push({
          type: 'url_special_chars',
          message: 'URL contains special characters',
          impact: 'low',
          details: {
            pathname: url.pathname,
          },
        });
        
        results.recommendations.push({
          type: 'url_special_chars',
          message: 'Remove special characters from URLs',
          impact: 'low',
          details: 'Special characters in URLs can cause encoding issues and are less user-friendly.',
        });
      }
      
      // Check for multiple slashes in URL
      if (url.pathname.includes('//')) {
        results.issues.push({
          type: 'url_multiple_slashes',
          message: 'URL contains multiple consecutive slashes',
          impact: 'low',
          details: {
            pathname: url.pathname,
          },
        });
        
        results.recommendations.push({
          type: 'url_multiple_slashes',
          message: 'Fix URLs with multiple consecutive slashes',
          impact: 'low',
          details: 'Multiple slashes in URLs can create duplicate content issues as they might be treated as different URLs.',
        });
      }
    } catch (error) {
      logger.warn(`Error parsing URL ${page.url}:`, error);
    }
  },
  
  /**
   * Check page load speed
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkPageSpeed(page, results) {
    results.maxScore += 3;
    
    // Basic page load time check based on crawler data
    if (page.loadTime) {
      if (page.loadTime > 3000) {
        results.issues.push({
          type: 'slow_page_load',
          message: `Page load time is slow (${Math.round(page.loadTime)}ms)`,
          impact: 'high',
          details: {
            loadTime: page.loadTime,
          },
        });
        
        results.recommendations.push({
          type: 'slow_page_load',
          message: 'Improve page load time to under 3 seconds',
          impact: 'high',
          details: 'Slow page load times negatively impact user experience and SEO.',
        });
      }
    }
    
    // Check metrics if available
    if (page.metrics) {
      // Time to First Byte (TTFB)
      if (page.metrics.ttfb && page.metrics.ttfb > 600) {
        results.issues.push({
          type: 'high_ttfb',
          message: `Time to First Byte (TTFB) is high (${page.metrics.ttfb}ms)`,
          impact: 'medium',
          details: {
            ttfb: page.metrics.ttfb,
          },
        });
        
        results.recommendations.push({
          type: 'high_ttfb',
          message: 'Improve server response time to reduce TTFB',
          impact: 'medium',
          details: 'High TTFB indicates server performance issues that can impact both user experience and SEO.',
        });
      }
      
      // DOM Content Loaded
      if (page.metrics.domContentLoaded && page.metrics.domContentLoaded > 2500) {
        results.issues.push({
          type: 'slow_dom_content_loaded',
          message: `DOM Content Loaded time is slow (${page.metrics.domContentLoaded}ms)`,
          impact: 'medium',
          details: {
            domContentLoaded: page.metrics.domContentLoaded,
          },
        });
        
        results.recommendations.push({
          type: 'slow_dom_content_loaded',
          message: 'Optimize critical rendering path to improve content loading time',
          impact: 'medium',
          details: 'Slow DOM content loading impacts how quickly users can see and interact with your page.',
        });
      }
    }
  },
  
  /**
   * Check basic mobile friendliness
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkMobileFriendliness(page, results) {
    results.maxScore += 1;
    
    // In a real implementation, we'd have more data about viewport, 
    // tap targets, font sizes, etc. Here we'll just check if we can
    // find any mobile-related issues in the available data.
    
    // For now, this is mostly a placeholder for where real mobile
    // checks would go in a production system.
    
    // Basic check for viewport meta tag indication
    if (page.seoData) {
      let hasViewport = false;
      
      // Look in meta tags (simplified check)
      if (page.seoData.ogTags && Object.keys(page.seoData.ogTags).length > 0) {
        // Has OG tags which suggests modern development
        hasViewport = true;
      }
      
      if (!hasViewport) {
        results.issues.push({
          type: 'potentially_not_mobile_friendly',
          message: 'Page may not be mobile-friendly',
          impact: 'high',
        });
        
        results.recommendations.push({
          type: 'potentially_not_mobile_friendly',
          message: 'Ensure the page is mobile-friendly with responsive design',
          impact: 'high',
          details: 'Mobile-friendliness is a major ranking factor for mobile search results.',
        });
      }
    }
  },
};

export default technicalAnalyzer;
