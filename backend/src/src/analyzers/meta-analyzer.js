import logger from '../utils/logger.js';

/**
 * Analyzes meta information and title tags
 */
const metaAnalyzer = {
  /**
   * Analyze page metadata
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
      
      // Check title
      this.checkTitle(page, results);
      
      // Check meta description
      this.checkMetaDescription(page, results);
      
      // Check canonical
      this.checkCanonical(page, results);
      
      // Check robots meta
      this.checkRobotsMeta(page, results);
      
      // Check Open Graph tags
      this.checkOpenGraph(page, results);
      
      // Check Twitter tags
      this.checkTwitter(page, results);
      
      // Calculate score
      results.score = Math.min(
        results.maxScore - results.issues.length,
        results.maxScore
      );
      
      // Calculate percentage
      results.percentage = results.maxScore > 0
        ? Math.round((results.score / results.maxScore) * 100)
        : 100;
      
      logger.debug(`Meta analysis for ${page.url}`, {
        score: results.score,
        maxScore: results.maxScore,
        issues: results.issues.length,
      });
      
      return results;
    } catch (error) {
      logger.error(`Error analyzing meta tags for ${page.url}:`, error);
      return {
        issues: [{
          type: 'error',
          message: `Error analyzing meta tags: ${error.message}`,
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
   * Check page title
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkTitle(page, results) {
    results.maxScore += 3;
    
    // Check if title exists
    if (!page.title) {
      results.issues.push({
        type: 'missing_title',
        message: 'Page is missing a title tag',
        impact: 'high',
      });
      
      results.recommendations.push({
        type: 'missing_title',
        message: 'Add a title tag to the page',
        impact: 'high',
        details: 'Title tags are crucial for SEO and are displayed in search results.',
      });
      
      return;
    }
    
    // Check title length (Google typically displays the first 50-60 characters)
    if (page.title.length < 10) {
      results.issues.push({
        type: 'title_too_short',
        message: 'Page title is too short (less than 10 characters)',
        impact: 'medium',
        details: {
          title: page.title,
          length: page.title.length,
        },
      });
      
      results.recommendations.push({
        type: 'title_too_short',
        message: 'Expand the page title to be more descriptive',
        impact: 'medium',
        details: 'Short titles may not provide enough context for search engines and users.',
      });
    } else if (page.title.length > 60) {
      results.issues.push({
        type: 'title_too_long',
        message: 'Page title is too long (more than 60 characters)',
        impact: 'low',
        details: {
          title: page.title,
          length: page.title.length,
        },
      });
      
      results.recommendations.push({
        type: 'title_too_long',
        message: 'Consider shortening the page title to under 60 characters',
        impact: 'low',
        details: 'Long titles may be truncated in search results, potentially hiding important information.',
      });
    }
    
    // Check for common title issues
    if (page.title.toLowerCase().includes('untitled') || 
        page.title.toLowerCase().includes('new page') ||
        page.title === 'Home') {
      results.issues.push({
        type: 'generic_title',
        message: 'Page has a generic or default title',
        impact: 'medium',
        details: {
          title: page.title,
        },
      });
      
      results.recommendations.push({
        type: 'generic_title',
        message: 'Replace the generic title with a descriptive one',
        impact: 'medium',
        details: 'Generic titles don\'t help users or search engines understand what the page is about.',
      });
    }
  },
  
  /**
   * Check meta description
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkMetaDescription(page, results) {
    results.maxScore += 3;
    
    // Check if meta description exists
    if (!page.description) {
      results.issues.push({
        type: 'missing_meta_description',
        message: 'Page is missing a meta description',
        impact: 'medium',
      });
      
      results.recommendations.push({
        type: 'missing_meta_description',
        message: 'Add a meta description to the page',
        impact: 'medium',
        details: 'Meta descriptions are often shown in search results and influence click-through rates.',
      });
      
      return;
    }
    
    // Check description length (Google typically displays around 155-160 characters)
    if (page.description.length < 50) {
      results.issues.push({
        type: 'description_too_short',
        message: 'Meta description is too short (less than 50 characters)',
        impact: 'low',
        details: {
          description: page.description,
          length: page.description.length,
        },
      });
      
      results.recommendations.push({
        type: 'description_too_short',
        message: 'Expand the meta description to be more descriptive',
        impact: 'low',
        details: 'Short descriptions may not provide enough information to attract clicks from search results.',
      });
    } else if (page.description.length > 160) {
      results.issues.push({
        type: 'description_too_long',
        message: 'Meta description is too long (more than 160 characters)',
        impact: 'low',
        details: {
          description: page.description,
          length: page.description.length,
        },
      });
      
      results.recommendations.push({
        type: 'description_too_long',
        message: 'Consider shortening the meta description to under 160 characters',
        impact: 'low',
        details: 'Long descriptions may be truncated in search results, potentially hiding important information.',
      });
    }
    
    // Check for generic descriptions
    if (page.description.toLowerCase().includes('welcome to') ||
        page.description.toLowerCase().includes('this is a website')) {
      results.issues.push({
        type: 'generic_description',
        message: 'Meta description is generic',
        impact: 'medium',
        details: {
          description: page.description,
        },
      });
      
      results.recommendations.push({
        type: 'generic_description',
        message: 'Replace the generic meta description with a specific one',
        impact: 'medium',
        details: 'Generic descriptions don\'t entice users to click through from search results.',
      });
    }
  },
  
  /**
   * Check canonical URL
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkCanonical(page, results) {
    results.maxScore += 2;
    
    const canonical = page.seoData?.canonical;
    
    // Check if canonical exists
    if (!canonical) {
      results.issues.push({
        type: 'missing_canonical',
        message: 'Page is missing a canonical tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_canonical',
        message: 'Add a canonical tag to the page',
        impact: 'low',
        details: 'Canonical tags help prevent duplicate content issues by specifying the preferred URL version.',
      });
      
      return;
    }
    
    try {
      // Check if canonical is valid
      const canonicalUrl = new URL(canonical);
      
      // Check if canonical points to a different page
      if (canonicalUrl.href !== page.url && 
          canonicalUrl.href !== page.url.replace(/\/$/, '')) {
        results.issues.push({
          type: 'non_self_canonical',
          message: 'Canonical URL points to a different page',
          impact: 'medium',
          details: {
            pageUrl: page.url,
            canonical: canonical,
          },
        });
        
        results.recommendations.push({
          type: 'non_self_canonical',
          message: 'Review the canonical tag to ensure it\'s intentionally pointing to another URL',
          impact: 'medium',
          details: 'When a page canonicalizes to a different URL, it indicates that the current URL is not the preferred version.',
        });
      }
    } catch (error) {
      results.issues.push({
        type: 'invalid_canonical',
        message: 'Canonical URL is invalid',
        impact: 'medium',
        details: {
          canonical: canonical,
          error: error.message,
        },
      });
      
      results.recommendations.push({
        type: 'invalid_canonical',
        message: 'Fix the invalid canonical URL',
        impact: 'medium',
        details: 'Invalid canonical URLs can confuse search engines and negate the benefits of canonicalization.',
      });
    }
  },
  
  /**
   * Check robots meta tag
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkRobotsMeta(page, results) {
    results.maxScore += 1;
    
    const robotsMeta = page.seoData?.robots;
    
    if (robotsMeta) {
      const robotsValue = robotsMeta.toLowerCase();
      
      if (robotsValue.includes('noindex') || 
          robotsValue.includes('none')) {
        results.issues.push({
          type: 'noindex',
          message: 'Page has noindex directive',
          impact: 'high',
          details: {
            robots: robotsMeta,
          },
        });
        
        results.recommendations.push({
          type: 'noindex',
          message: 'Review if the noindex directive is intentional',
          impact: 'high',
          details: 'Pages with noindex will not be included in search results.',
        });
      }
      
      if (robotsValue.includes('nofollow') || 
          robotsValue.includes('none')) {
        results.issues.push({
          type: 'nofollow',
          message: 'Page has nofollow directive',
          impact: 'medium',
          details: {
            robots: robotsMeta,
          },
        });
        
        results.recommendations.push({
          type: 'nofollow',
          message: 'Review if the nofollow directive is intentional',
          impact: 'medium',
          details: 'Pages with nofollow won\'t pass link equity to other pages they link to.',
        });
      }
    }
  },
  
  /**
   * Check Open Graph tags
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkOpenGraph(page, results) {
    results.maxScore += 1;
    
    const ogTags = page.seoData?.ogTags || {};
    const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const missingTags = requiredOgTags.filter(tag => !ogTags[tag]);
    
    if (missingTags.length > 0) {
      results.issues.push({
        type: 'missing_og_tags',
        message: 'Page is missing important Open Graph tags',
        impact: 'low',
        details: {
          missingTags,
        },
      });
      
      results.recommendations.push({
        type: 'missing_og_tags',
        message: `Add the following Open Graph tags: ${missingTags.join(', ')}`,
        impact: 'low',
        details: 'Open Graph tags improve how content appears when shared on social media platforms.',
      });
    }
  },
  
  /**
   * Check Twitter card tags
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkTwitter(page, results) {
    results.maxScore += 1;
    
    const twitterTags = page.seoData?.twitterTags || {};
    
    if (!twitterTags['twitter:card']) {
      results.issues.push({
        type: 'missing_twitter_card',
        message: 'Page is missing Twitter card markup',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_twitter_card',
        message: 'Add Twitter card markup to the page',
        impact: 'low',
        details: 'Twitter cards help content look better when shared on Twitter.',
      });
    }
  },
};

export default metaAnalyzer;
