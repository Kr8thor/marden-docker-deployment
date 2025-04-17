import logger from '../utils/logger.js';

/**
 * Generates structured SEO audit reports
 */
const reportGenerator = {
  /**
   * Generate a complete SEO report from analysis results
   * @param {Object} analysisResults - Results from SEO analyzer
   * @param {Object} options - Report generation options
   * @returns {Object} Structured report
   */
  generateReport(analysisResults, options = {}) {
    try {
      logger.debug('Generating report', { 
        baseUrl: analysisResults.baseUrl,
        options,
      });
      
      // Start with basic report structure
      const report = {
        id: options.id || null,
        type: 'seo_audit',
        timestamp: new Date().toISOString(),
        auditTarget: {
          baseUrl: analysisResults.baseUrl,
          scanned: analysisResults.crawlStats?.pagesVisited || 0,
        },
        summary: this.generateSummary(analysisResults),
        scores: analysisResults.scores,
        prioritizedRecommendations: this.generatePrioritizedRecommendations(analysisResults),
      };
      
      // Add detailed sections based on options
      if (options.includeDetails !== false) {
        report.details = {
          issueBreakdown: this.generateIssueBreakdown(analysisResults),
          pageDetails: this.generatePageDetails(analysisResults),
        };
      }
      
      logger.debug('Report generation complete', {
        id: report.id,
        recommendationCount: report.prioritizedRecommendations.length,
      });
      
      return report;
    } catch (error) {
      logger.error('Error generating report:', error);
      
      return {
        error: true,
        message: `Failed to generate report: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  },
  
  /**
   * Generate the executive summary section
   * @param {Object} results - Analysis results
   * @returns {Object} Summary section
   */
  generateSummary(results) {
    // Generate overall health assessment based on scores
    let healthStatus;
    
    if (results.scores.overall >= 90) {
      healthStatus = 'excellent';
    } else if (results.scores.overall >= 70) {
      healthStatus = 'good';
    } else if (results.scores.overall >= 50) {
      healthStatus = 'fair';
    } else if (results.scores.overall >= 30) {
      healthStatus = 'poor';
    } else {
      healthStatus = 'critical';
    }
    
    // Create summary text
    const summary = {
      healthStatus,
      overallScore: results.scores.overall,
      totalIssues: results.totalIssues,
      criticalIssueCount: this.countIssuesByImpact(results, 'high'),
      text: this.generateSummaryText(results, healthStatus),
      topStrengths: this.identifyTopStrengths(results),
      topWeaknesses: this.identifyTopWeaknesses(results),
      categoryScores: {
        meta: results.scores.meta,
        content: results.scores.content,
        technical: results.scores.technical,
      },
    };
    
    return summary;
  },
  
  /**
   * Generate the prioritized recommendations section
   * @param {Object} results - Analysis results
   * @returns {Array} Prioritized recommendations
   */
  generatePrioritizedRecommendations(results) {
    if (!results.recommendations || results.recommendations.length === 0) {
      return [];
    }
    
    // Get the top 10 recommendations sorted by impact and prevalence
    return results.recommendations
      .slice(0, 10)
      .map(rec => ({
        id: `${rec.category}_${rec.type}`,
        title: rec.message,
        description: rec.details || '',
        impact: rec.impact,
        category: rec.category,
        affectedPages: rec.affectedPages || 1,
        examples: rec.examplePages || [rec.url].filter(Boolean),
      }));
  },
  
  /**
   * Generate the issue breakdown section
   * @param {Object} results - Analysis results
   * @returns {Object} Issue breakdown by category and impact
   */
  generateIssueBreakdown(results) {
    // Initialize counters
    const breakdownByCategory = {
      meta: { high: 0, medium: 0, low: 0, total: 0 },
      content: { high: 0, medium: 0, low: 0, total: 0 },
      technical: { high: 0, medium: 0, low: 0, total: 0 },
    };
    
    const breakdownByImpact = {
      high: 0,
      medium: 0,
      low: 0,
    };
    
    // Count issues from all pages
    if (results.pages) {
      for (const pageResult of Object.values(results.pages)) {
        // Skip pages that don't have issues array
        if (!pageResult.issues || pageResult.skipped || pageResult.error) {
          continue;
        }
        
        for (const issue of pageResult.issues) {
          const category = issue.category || 'other';
          const impact = issue.impact || 'medium';
          
          // Update category counts
          if (breakdownByCategory[category]) {
            breakdownByCategory[category][impact]++;
            breakdownByCategory[category].total++;
          }
          
          // Update impact counts
          breakdownByImpact[impact]++;
        }
      }
    }
    
    return {
      byCategory: breakdownByCategory,
      byImpact: breakdownByImpact,
      mostCommonIssues: results.topIssues || [],
    };
  },
  
  /**
   * Generate the detailed page information section
   * @param {Object} results - Analysis results
   * @returns {Array} Page details array
   */
  generatePageDetails(results) {
    if (!results.pages) {
      return [];
    }
    
    const pageDetails = [];
    
    for (const [pageId, pageResult] of Object.entries(results.pages)) {
      // Skip pages that were not analyzed
      if (pageResult.skipped || pageResult.error) {
        pageDetails.push({
          url: pageResult.url,
          skipped: true,
          reason: pageResult.reason || 'error',
          error: pageResult.error || null,
        });
        continue;
      }
      
      pageDetails.push({
        url: pageResult.url,
        score: pageResult.scores.overall,
        issueCount: pageResult.issues?.length || 0,
        categories: {
          meta: pageResult.scores.meta,
          content: pageResult.scores.content,
          technical: pageResult.scores.technical,
        },
        topIssues: (pageResult.issues || [])
          .slice(0, 5)
          .map(issue => ({
            type: issue.type,
            message: issue.message,
            impact: issue.impact,
            category: issue.category,
          })),
      });
    }
    
    // Sort by score (worst first)
    return pageDetails.sort((a, b) => {
      // Put skipped pages at the end
      if (a.skipped && !b.skipped) return 1;
      if (!a.skipped && b.skipped) return -1;
      if (a.skipped && b.skipped) return 0;
      
      // Sort by score
      return a.score - b.score;
    });
  },
  
  /**
   * Generate a human-readable summary text
   * @param {Object} results - Analysis results
   * @param {string} healthStatus - Health status descriptor
   * @returns {string} Summary text
   */
  generateSummaryText(results, healthStatus) {
    const baseUrl = results.baseUrl;
    const score = results.scores.overall;
    const pageCount = results.crawlStats?.pagesVisited || 0;
    const issueCount = results.totalIssues || 0;
    const highImpactCount = this.countIssuesByImpact(results, 'high');
    
    let summary = `The SEO health of ${baseUrl} is ${healthStatus} with an overall score of ${score}/100. `;
    
    summary += `The audit analyzed ${pageCount} pages and found ${issueCount} issues, `;
    summary += `including ${highImpactCount} critical issues that should be addressed promptly. `;
    
    // Add category-specific insights
    const categoryScores = results.scores;
    const lowestCategory = Object.entries(categoryScores)
      .filter(([key]) => key !== 'overall')
      .sort(([, a], [, b]) => a - b)[0];
    
    if (lowestCategory) {
      const [category, categoryScore] = lowestCategory;
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      
      summary += `${categoryName}-related factors received the lowest score (${categoryScore}/100) `;
      summary += `and present the greatest opportunity for improvement. `;
    }
    
    // Add recommendation count
    const recommendationCount = results.recommendations?.length || 0;
    
    if (recommendationCount > 0) {
      summary += `This report provides ${recommendationCount} actionable recommendations `;
      summary += `prioritized by their potential impact on your SEO performance.`;
    } else {
      summary += `No specific recommendations were identified.`;
    }
    
    return summary;
  },
  
  /**
   * Count issues by impact level
   * @param {Object} results - Analysis results
   * @param {string} impactLevel - Impact level to count
   * @returns {number} Issue count
   */
  countIssuesByImpact(results, impactLevel) {
    let count = 0;
    
    // If we have aggregate results, use the breakdown
    if (results.issueTypeCounts) {
      // We'll need to iterate through all pages to count by impact
      for (const pageResult of Object.values(results.pages || {})) {
        if (!pageResult.issues) continue;
        
        for (const issue of pageResult.issues) {
          if (issue.impact === impactLevel) {
            count++;
          }
        }
      }
    } else if (results.issues) {
      // Direct count from a page result
      count = results.issues.filter(issue => issue.impact === impactLevel).length;
    }
    
    return count;
  },
  
  /**
   * Identify top strengths based on analysis
   * @param {Object} results - Analysis results
   * @returns {Array} Top strengths
   */
  identifyTopStrengths(results) {
    const strengths = [];
    
    // If overall score is good, that's a strength
    if (results.scores.overall >= 80) {
      strengths.push('Strong overall SEO health');
    }
    
    // Look for high category scores
    Object.entries(results.scores)
      .filter(([key]) => key !== 'overall')
      .forEach(([category, score]) => {
        if (score >= 90) {
          strengths.push(`Excellent ${category} optimization (${score}/100)`);
        } else if (score >= 80) {
          strengths.push(`Strong ${category} practices (${score}/100)`);
        }
      });
    
    // If few high-impact issues, that's a strength
    const highImpactCount = this.countIssuesByImpact(results, 'high');
    if (highImpactCount === 0) {
      strengths.push('No critical SEO issues detected');
    } else if (highImpactCount <= 2) {
      strengths.push('Few critical SEO issues');
    }
    
    // Default strength if none identified
    if (strengths.length === 0) {
      strengths.push('Website has potential for SEO improvement');
    }
    
    return strengths.slice(0, 3);
  },
  
  /**
   * Identify top weaknesses based on analysis
   * @param {Object} results - Analysis results
   * @returns {Array} Top weaknesses
   */
  identifyTopWeaknesses(results) {
    const weaknesses = [];
    
    // If overall score is poor, that's a weakness
    if (results.scores.overall < 50) {
      weaknesses.push('Poor overall SEO health');
    }
    
    // Look for low category scores
    Object.entries(results.scores)
      .filter(([key]) => key !== 'overall')
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2)
      .forEach(([category, score]) => {
        if (score < 40) {
          weaknesses.push(`Critical issues with ${category} (${score}/100)`);
        } else if (score < 60) {
          weaknesses.push(`Poor ${category} optimization (${score}/100)`);
        } else if (score < 75) {
          weaknesses.push(`${category} needs improvement (${score}/100)`);
        }
      });
    
    // If many high-impact issues, that's a weakness
    const highImpactCount = this.countIssuesByImpact(results, 'high');
    if (highImpactCount > 10) {
      weaknesses.push(`Large number of critical SEO issues (${highImpactCount})`);
    } else if (highImpactCount > 5) {
      weaknesses.push(`Several critical SEO issues (${highImpactCount})`);
    }
    
    // Check for most common issues
    if (results.topIssues && results.topIssues.length > 0) {
      const topIssue = results.topIssues[0];
      if (topIssue.count > 5) {
        weaknesses.push(`Widespread issue: ${topIssue.type} (${topIssue.count} instances)`);
      }
    }
    
    // Default weakness if none identified
    if (weaknesses.length === 0) {
      weaknesses.push('Some opportunities for SEO improvement');
    }
    
    return weaknesses.slice(0, 3);
  },
};

export default reportGenerator;
