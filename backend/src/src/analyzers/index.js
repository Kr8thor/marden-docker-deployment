import metaAnalyzer from './meta-analyzer.js';
import contentAnalyzer from './content-analyzer.js';
import technicalAnalyzer from './technical-analyzer.js';
import logger from '../utils/logger.js';

/**
 * Main SEO analyzer that combines results from all specialized analyzers
 */
const seoAnalyzer = {
  /**
   * Run comprehensive SEO analysis on a page
   * @param {Object} page - Page data from crawler
   * @param {Object} options - Analysis options
   * @returns {Object} Combined analysis results
   */
  async analyzePage(page, options = {}) {
    logger.debug(`Starting analysis for page ${page.url}`);
    
    try {
      // Run all analyzers in parallel
      const [metaResults, contentResults, technicalResults] = await Promise.all([
        metaAnalyzer.analyze(page, options),
        contentAnalyzer.analyze(page, options),
        technicalAnalyzer.analyze(page, options),
      ]);
      
      // Combine all issues
      const allIssues = [
        ...metaResults.issues.map(issue => ({ ...issue, category: 'meta' })),
        ...contentResults.issues.map(issue => ({ ...issue, category: 'content' })),
        ...technicalResults.issues.map(issue => ({ ...issue, category: 'technical' })),
      ];
      
      // Calculate overall score
      const totalScore = metaResults.score + contentResults.score + technicalResults.score;
      const totalMaxScore = metaResults.maxScore + contentResults.maxScore + technicalResults.maxScore;
      const overallPercentage = totalMaxScore > 0
        ? Math.round((totalScore / totalMaxScore) * 100)
        : 100;
      
      // Combine all recommendations
      const allRecommendations = [
        ...metaResults.recommendations.map(rec => ({ ...rec, category: 'meta' })),
        ...contentResults.recommendations.map(rec => ({ ...rec, category: 'content' })),
        ...technicalResults.recommendations.map(rec => ({ ...rec, category: 'technical' })),
      ];
      
      // Sort recommendations by impact
      const sortedRecommendations = this.sortRecommendationsByPriority(allRecommendations);
      
      const results = {
        url: page.url,
        timestamp: new Date().toISOString(),
        scores: {
          overall: overallPercentage,
          meta: metaResults.percentage,
          content: contentResults.percentage,
          technical: technicalResults.percentage,
        },
        categories: {
          meta: metaResults,
          content: contentResults,
          technical: technicalResults,
        },
        issues: allIssues,
        issueCount: allIssues.length,
        recommendations: sortedRecommendations,
      };
      
      logger.debug(`Completed analysis for page ${page.url}`, {
        overall: overallPercentage,
        issueCount: allIssues.length,
      });
      
      return results;
    } catch (error) {
      logger.error(`Error analyzing page ${page.url}:`, error);
      
      return {
        url: page.url,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
        },
        scores: {
          overall: 0,
          meta: 0,
          content: 0,
          technical: 0,
        },
        issues: [{
          type: 'error',
          message: `Error during analysis: ${error.message}`,
          impact: 'high',
          category: 'general',
        }],
        issueCount: 1,
        recommendations: [],
      };
    }
  },
  
  /**
   * Analyze multiple pages and aggregate results
   * @param {Object} crawlData - Data from crawler with multiple pages
   * @param {Object} options - Analysis options
   * @returns {Object} Aggregate analysis results
   */
  async analyzeSite(crawlData, options = {}) {
    try {
      logger.info(`Starting site-wide analysis for ${crawlData.baseUrl}`, {
        pageCount: Object.keys(crawlData.pages).length,
      });
      
      const pageResults = {};
      const pagePromises = [];
      
      // Process each page
      for (const [pageId, pageData] of Object.entries(crawlData.pages)) {
        // Skip pages with errors or non-HTML pages
        if (
          pageData.status === 'error' ||
          pageData.statusCode >= 400 ||
          (pageData.contentType && !pageData.contentType.includes('text/html'))
        ) {
          pageResults[pageId] = {
            url: pageData.url,
            skipped: true,
            reason: pageData.status === 'error' 
              ? 'error' 
              : pageData.statusCode >= 400 
                ? `status_${pageData.statusCode}` 
                : 'not_html',
          };
          continue;
        }
        
        // Analyze each page
        const promise = this.analyzePage(pageData, options)
          .then(result => {
            pageResults[pageId] = result;
            return result;
          })
          .catch(error => {
            logger.error(`Error analyzing page ${pageData.url}:`, error);
            pageResults[pageId] = {
              url: pageData.url,
              error: error.message,
            };
          });
        
        pagePromises.push(promise);
      }
      
      // Wait for all page analyses to complete
      await Promise.all(pagePromises);
      
      // Aggregate results
      const siteResults = this.aggregateSiteResults(crawlData, pageResults);
      
      logger.info(`Completed site-wide analysis for ${crawlData.baseUrl}`, {
        pageCount: Object.keys(pageResults).length,
        overallScore: siteResults.scores.overall,
      });
      
      return siteResults;
    } catch (error) {
      logger.error(`Error during site-wide analysis:`, error);
      
      return {
        baseUrl: crawlData.baseUrl,
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
        },
        pages: {},
        scores: {
          overall: 0,
          meta: 0, 
          content: 0,
          technical: 0,
        },
        totalIssues: 0,
        topIssues: [],
        recommendations: [],
      };
    }
  },
  
  /**
   * Aggregate individual page results into site-wide results
   * @param {Object} crawlData - Data from crawler
   * @param {Object} pageResults - Results for individual pages
   * @returns {Object} Aggregated site results
   */
  aggregateSiteResults(crawlData, pageResults) {
    // Aggregate scores
    const validResults = Object.values(pageResults).filter(result => !result.skipped && !result.error);
    
    // Calculate average scores
    let overallSum = 0;
    let metaSum = 0;
    let contentSum = 0;
    let technicalSum = 0;
    
    validResults.forEach(result => {
      overallSum += result.scores.overall;
      metaSum += result.scores.meta;
      contentSum += result.scores.content;
      technicalSum += result.scores.technical;
    });
    
    const pageCount = validResults.length;
    
    const scores = {
      overall: pageCount > 0 ? Math.round(overallSum / pageCount) : 0,
      meta: pageCount > 0 ? Math.round(metaSum / pageCount) : 0,
      content: pageCount > 0 ? Math.round(contentSum / pageCount) : 0,
      technical: pageCount > 0 ? Math.round(technicalSum / pageCount) : 0,
    };
    
    // Collect all issues across pages
    const allIssues = [];
    
    validResults.forEach(result => {
      result.issues.forEach(issue => {
        allIssues.push({
          ...issue,
          url: result.url,
        });
      });
    });
    
    // Count issue types
    const issueTypeCounts = {};
    
    allIssues.forEach(issue => {
      const type = issue.type;
      issueTypeCounts[type] = (issueTypeCounts[type] || 0) + 1;
    });
    
    // Get most common issues
    const topIssueTypes = Object.entries(issueTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));
    
    // Gather site-wide recommendations
    const recommendationMap = new Map();
    
    validResults.forEach(result => {
      result.recommendations.forEach(rec => {
        const key = `${rec.category}:${rec.type}`;
        
        if (!recommendationMap.has(key)) {
          recommendationMap.set(key, {
            ...rec,
            pages: [],
            count: 0,
          });
        }
        
        const recommendation = recommendationMap.get(key);
        recommendation.count++;
        recommendation.pages.push(result.url);
      });
    });
    
    // Convert to array and sort by priority
    const recommendations = Array.from(recommendationMap.values())
      .sort((a, b) => {
        // Sort first by impact
        const impactOrder = { high: 0, medium: 1, low: 2 };
        const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
        
        if (impactDiff !== 0) return impactDiff;
        
        // Then by count
        return b.count - a.count;
      })
      .map(rec => ({
        ...rec,
        affectedPages: rec.count,
        // Limit the number of example pages to avoid huge payloads
        examplePages: rec.pages.slice(0, 5),
      }));
    
    return {
      baseUrl: crawlData.baseUrl,
      timestamp: new Date().toISOString(),
      crawlStats: {
        pagesVisited: crawlData.pagesVisited,
        crawlDuration: crawlData.duration,
      },
      scores,
      pages: pageResults,
      totalIssues: allIssues.length,
      issueTypeCounts,
      topIssues: topIssueTypes,
      recommendations,
    };
  },
  
  /**
   * Sort recommendations by priority
   * @param {Array} recommendations - List of recommendations
   * @returns {Array} Sorted recommendations
   */
  sortRecommendationsByPriority(recommendations) {
    return recommendations.sort((a, b) => {
      // Sort by impact (high > medium > low)
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });
  },
};

export default seoAnalyzer;
