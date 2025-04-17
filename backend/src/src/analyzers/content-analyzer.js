import logger from '../utils/logger.js';

/**
 * Analyzes page content including headings, text, and structure
 */
const contentAnalyzer = {
  /**
   * Analyze page content
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
      
      // Check headings structure
      this.checkHeadings(page, results);
      
      // Check content/text
      this.checkContent(page, results);
      
      // Check images
      this.checkImages(page, results);
      
      // Check links
      this.checkLinks(page, results);
      
      // Calculate score
      results.score = Math.min(
        results.maxScore - results.issues.length,
        results.maxScore
      );
      
      // Calculate percentage
      results.percentage = results.maxScore > 0
        ? Math.round((results.score / results.maxScore) * 100)
        : 100;
      
      logger.debug(`Content analysis for ${page.url}`, {
        score: results.score,
        maxScore: results.maxScore,
        issues: results.issues.length,
      });
      
      return results;
    } catch (error) {
      logger.error(`Error analyzing content for ${page.url}:`, error);
      return {
        issues: [{
          type: 'error',
          message: `Error analyzing content: ${error.message}`,
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
   * Check headings structure and content
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkHeadings(page, results) {
    results.maxScore += 3;
    
    // Check if H1 exists
    if (!page.h1 || page.headings.h1.length === 0) {
      results.issues.push({
        type: 'missing_h1',
        message: 'Page is missing an H1 heading',
        impact: 'high',
      });
      
      results.recommendations.push({
        type: 'missing_h1',
        message: 'Add an H1 heading to the page',
        impact: 'high',
        details: 'The H1 heading is a crucial element for both SEO and accessibility.',
      });
    } else if (page.headings.h1.length > 1) {
      // Check if there are multiple H1s
      results.issues.push({
        type: 'multiple_h1',
        message: `Page has multiple H1 headings (${page.headings.h1.length})`,
        impact: 'medium',
        details: {
          h1s: page.headings.h1.map(h => h.text),
        },
      });
      
      results.recommendations.push({
        type: 'multiple_h1',
        message: 'Keep only one H1 heading on the page',
        impact: 'medium',
        details: 'Multiple H1 headings can confuse users and search engines about the main topic of the page.',
      });
    }
    
    // Check if H1 is similar to title
    if (page.h1 && page.title) {
      const h1 = page.h1.toLowerCase();
      const title = page.title.toLowerCase();
      
      // Very basic similarity check
      if (!h1.includes(title.substring(0, 10)) && 
          !title.includes(h1.substring(0, 10))) {
        results.issues.push({
          type: 'h1_different_from_title',
          message: 'H1 heading is significantly different from title',
          impact: 'medium',
          details: {
            h1: page.h1,
            title: page.title,
          },
        });
        
        results.recommendations.push({
          type: 'h1_different_from_title',
          message: 'Make the H1 heading consistent with the page title',
          impact: 'medium',
          details: 'The H1 and title should be aligned to reinforce the main topic of the page.',
        });
      }
    }
    
    // Check headings structure (h2, h3, etc.)
    let previousLevel = 1;
    const headingLevels = [];
    
    for (let i = 1; i <= 6; i++) {
      if (page.headings[`h${i}`] && page.headings[`h${i}`].length > 0) {
        headingLevels.push(i);
      }
    }
    
    let hasSkippedLevel = false;
    
    for (let i = 0; i < headingLevels.length - 1; i++) {
      const current = headingLevels[i];
      const next = headingLevels[i + 1];
      
      if (next - current > 1) {
        hasSkippedLevel = true;
        break;
      }
    }
    
    if (hasSkippedLevel) {
      results.issues.push({
        type: 'skipped_heading_level',
        message: 'Page has skipped heading levels (e.g., H1 to H3 without H2)',
        impact: 'low',
        details: {
          headingLevels,
        },
      });
      
      results.recommendations.push({
        type: 'skipped_heading_level',
        message: 'Fix heading hierarchy to follow a proper sequence',
        impact: 'low',
        details: 'Proper heading hierarchy is important for accessibility and helps establish content structure.',
      });
    }
  },
  
  /**
   * Check content quality and structure
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkContent(page, results) {
    results.maxScore += 2;
    
    // This is a simplified content check; in a real analyzer, we'd have the actual page content
    // For now, we'll use links, images, and headings as proxies for content
    
    // Check if page appears to have thin content
    const linkCount = page.links ? page.links.length : 0;
    const imageCount = page.images ? page.images.length : 0;
    
    let headingCount = 0;
    for (let i = 1; i <= 6; i++) {
      if (page.headings[`h${i}`]) {
        headingCount += page.headings[`h${i}`].length;
      }
    }
    
    // Rough heuristic for detecting thin content pages
    if (headingCount <= 1 && imageCount < 2 && linkCount < 5) {
      results.issues.push({
        type: 'thin_content',
        message: 'Page appears to have thin content',
        impact: 'high',
        details: {
          headings: headingCount,
          images: imageCount,
          links: linkCount,
        },
      });
      
      results.recommendations.push({
        type: 'thin_content',
        message: 'Add more valuable content to the page',
        impact: 'high',
        details: 'Thin content provides little value to users and typically performs poorly in search results.',
      });
    }
    
    // Check if structured data is present
    if (!page.seoData?.structuredData || 
        page.seoData.structuredData.length === 0) {
      results.issues.push({
        type: 'missing_structured_data',
        message: 'Page has no structured data',
        impact: 'medium',
      });
      
      results.recommendations.push({
        type: 'missing_structured_data',
        message: 'Add relevant structured data to the page',
        impact: 'medium',
        details: 'Structured data helps search engines understand your content and can enable rich results.',
      });
    }
  },
  
  /**
   * Check images on the page
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkImages(page, results) {
    results.maxScore += 2;
    
    if (!page.images || page.images.length === 0) {
      // Not necessarily an issue, but worth noting
      return;
    }
    
    // Check for missing alt text
    const imagesWithoutAlt = page.images.filter(img => !img.alt);
    
    if (imagesWithoutAlt.length > 0) {
      results.issues.push({
        type: 'images_missing_alt',
        message: `${imagesWithoutAlt.length} image(s) missing alt text`,
        impact: 'medium',
        details: {
          count: imagesWithoutAlt.length,
          images: imagesWithoutAlt.map(img => img.src),
        },
      });
      
      results.recommendations.push({
        type: 'images_missing_alt',
        message: 'Add descriptive alt text to all images',
        impact: 'medium',
        details: 'Alt text is essential for accessibility and provides contextual information for search engines.',
      });
    }
    
    // Check for large images without dimensions
    const imagesWithoutDimensions = page.images.filter(
      img => !img.width || !img.height
    );
    
    if (imagesWithoutDimensions.length > 0) {
      results.issues.push({
        type: 'images_missing_dimensions',
        message: `${imagesWithoutDimensions.length} image(s) missing width/height attributes`,
        impact: 'low',
        details: {
          count: imagesWithoutDimensions.length,
          images: imagesWithoutDimensions.map(img => img.src),
        },
      });
      
      results.recommendations.push({
        type: 'images_missing_dimensions',
        message: 'Add width and height attributes to images',
        impact: 'low',
        details: 'Specifying image dimensions helps prevent layout shifts during page load.',
      });
    }
    
    // Check for lazy loading
    const imagesWithoutLazyLoading = page.images.filter(
      img => !img.loading || img.loading !== 'lazy'
    );
    
    if (imagesWithoutLazyLoading.length > 3) { // Only flag if multiple images aren't lazy loaded
      results.issues.push({
        type: 'images_not_lazy_loaded',
        message: `${imagesWithoutLazyLoading.length} image(s) not using lazy loading`,
        impact: 'low',
        details: {
          count: imagesWithoutLazyLoading.length,
        },
      });
      
      results.recommendations.push({
        type: 'images_not_lazy_loaded',
        message: 'Add loading="lazy" attribute to images not visible in the initial viewport',
        impact: 'low',
        details: 'Lazy loading improves initial page load time by deferring off-screen images.',
      });
    }
  },
  
  /**
   * Check links on the page
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkLinks(page, results) {
    results.maxScore += 3;
    
    if (!page.links || page.links.length === 0) {
      results.issues.push({
        type: 'no_links',
        message: 'Page has no links',
        impact: 'medium',
      });
      
      results.recommendations.push({
        type: 'no_links',
        message: 'Add relevant internal and external links to the page',
        impact: 'medium',
        details: 'Links help users navigate your site and help search engines discover and understand page relationships.',
      });
      
      return;
    }
    
    // Check for empty link text
    const emptyLinks = page.links.filter(link => !link.text || link.text.trim() === '');
    
    if (emptyLinks.length > 0) {
      results.issues.push({
        type: 'empty_link_text',
        message: `${emptyLinks.length} link(s) have empty or missing link text`,
        impact: 'medium',
        details: {
          count: emptyLinks.length,
          links: emptyLinks.map(link => link.url),
        },
      });
      
      results.recommendations.push({
        type: 'empty_link_text',
        message: 'Add descriptive text to all links',
        impact: 'medium',
        details: 'Links without descriptive text are problematic for accessibility and provide less SEO value.',
      });
    }
    
    // Check for generic link text
    const genericTextRegex = /click here|read more|learn more|more info|details|link|download/i;
    const genericLinks = page.links.filter(
      link => link.text && genericTextRegex.test(link.text.trim())
    );
    
    if (genericLinks.length > 2) { // Only flag if multiple generic links
      results.issues.push({
        type: 'generic_link_text',
        message: `${genericLinks.length} link(s) use generic text like "click here" or "read more"`,
        impact: 'low',
        details: {
          count: genericLinks.length,
          examples: genericLinks.slice(0, 5).map(link => ({
            text: link.text,
            url: link.url,
          })),
        },
      });
      
      results.recommendations.push({
        type: 'generic_link_text',
        message: 'Replace generic link text with descriptive text',
        impact: 'low',
        details: 'Descriptive link text helps users and search engines understand where a link will take them.',
      });
    }
    
    // Check for excessive external links
    const externalLinks = page.links.filter(link => link.isExternal);
    const totalLinks = page.links.length;
    
    if (externalLinks.length > 0 && externalLinks.length / totalLinks > 0.5) {
      results.issues.push({
        type: 'excessive_external_links',
        message: `Page has a high ratio of external links (${externalLinks.length} of ${totalLinks})`,
        impact: 'medium',
        details: {
          externalCount: externalLinks.length,
          totalCount: totalLinks,
          ratio: (externalLinks.length / totalLinks).toFixed(2),
        },
      });
      
      results.recommendations.push({
        type: 'excessive_external_links',
        message: 'Consider reducing the number of external links',
        impact: 'medium',
        details: 'Too many external links can dilute the value of your page and send users away from your site.',
      });
    }
  },
};

export default contentAnalyzer;
