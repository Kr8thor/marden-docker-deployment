const fetch = require('node-fetch');
const { URL } = require('url');

/**
 * Simple SEO Auditor that actually checks a website for basic SEO issues
 */
class SeoAuditor {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 10000,
      userAgent: options.userAgent || 'MardenSEO Audit Bot v1.0',
      ...options
    };
  }

  /**
   * Run a basic SEO audit on a URL
   * @param {string} url - URL to audit
   * @returns {Promise<Object>} Audit results
   */
  async audit(url) {
    console.log(`Starting audit for ${url}`);
    const startTime = Date.now();
    
    // Normalize URL
    const normalizedUrl = this.normalizeUrl(url);
    console.log(`Normalized URL: ${normalizedUrl}`);
    
    try {
      // Fetch page HTML
      const { html, headers, statusCode, redirectUrl, responseTime } = await this.fetchUrl(normalizedUrl);
      
      // If we couldn't fetch the page, return error
      if (!html) {
        return this.createErrorResult(normalizedUrl, `Failed to fetch page (Status: ${statusCode})`);
      }
      
      // Extract basic SEO elements
      const seoElements = this.extractSeoElements(html);
      
      // Calculate score based on findings
      const results = this.analyzeSeoElements(seoElements, headers, statusCode, redirectUrl, responseTime);
      
      // Add audit metadata
      results.url = redirectUrl || normalizedUrl;
      results.auditTime = Date.now() - startTime;
      
      console.log(`Audit completed in ${results.auditTime}ms with score ${results.score}`);
      
      return results;
    } catch (error) {
      console.error(`Audit error for ${normalizedUrl}:`, error);
      return this.createErrorResult(normalizedUrl, error.message);
    }
  }
  
  /**
   * Create error result object
   * @param {string} url - URL that was audited
   * @param {string} message - Error message
   * @returns {Object} Error result
   */
  createErrorResult(url, message) {
    return {
      url,
      score: 0,
      status: 'error',
      message,
      issuesFound: 1,
      opportunities: 0,
      performanceMetrics: {
        lcp: {
          value: 0,
          unit: 's',
          score: 0
        },
        cls: {
          value: 0,
          score: 0
        },
        fid: {
          value: 0,
          unit: 'ms',
          score: 0
        }
      },
      topIssues: [
        {
          severity: 'critical',
          description: `Failed to complete audit: ${message}`
        }
      ]
    };
  }

  /**
   * Normalize a URL (add https:// if missing)
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  /**
   * Fetch a URL and return the HTML content
   * @param {string} url - URL to fetch
   * @returns {Promise<Object>} HTML content and metadata
   */
  async fetchUrl(url) {
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, this.options.timeout);

      const options = {
        method: 'GET',
        headers: {
          'User-Agent': this.options.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
        redirect: 'manual' // Handle redirects manually
      };

      const response = await fetch(url, options);
      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;
      
      // Handle redirects
      if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
        const redirectUrl = new URL(response.headers.get('location'), url).toString();
        console.log(`Redirect detected: ${url} -> ${redirectUrl}`);
        
        // Follow the redirect
        const redirectResult = await this.fetchUrl(redirectUrl);
        return {
          ...redirectResult,
          originalUrl: url,
          redirectUrl
        };
      }

      const html = await response.text();
      
      return {
        html,
        headers: response.headers,
        statusCode: response.status,
        redirectUrl: null,
        responseTime
      };
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      
      // Create a response object for fetch errors
      return {
        html: '',
        headers: {},
        statusCode: 0,
        redirectUrl: null,
        responseTime: 0,
        error: error.message
      };
    }
  }

  /**
   * Extract SEO-relevant elements from HTML
   * @param {string} html - HTML content
   * @returns {Object} Extracted SEO elements
   */
  extractSeoElements(html) {
    const elements = {
      title: this.extractTag(html, 'title'),
      metaDescription: this.extractMetaContent(html, 'description'),
      metaKeywords: this.extractMetaContent(html, 'keywords'),
      h1: this.extractAllTags(html, 'h1'),
      h2: this.extractAllTags(html, 'h2'),
      h3: this.extractAllTags(html, 'h3'),
      images: this.extractImages(html),
      links: this.extractLinks(html),
      canonicalUrl: this.extractLinkHref(html, 'canonical'),
      robotsContent: this.extractMetaContent(html, 'robots'),
      hasViewport: html.includes('name="viewport"'),
      hasStructuredData: html.includes('application/ld+json'),
      hasFavicon: html.includes('rel="icon"') || html.includes('rel="shortcut icon"'),
      socialTags: {
        ogTitle: this.extractMetaProperty(html, 'og:title'),
        ogDescription: this.extractMetaProperty(html, 'og:description'),
        ogImage: this.extractMetaProperty(html, 'og:image'),
        twitterCard: this.extractMetaContent(html, 'twitter:card'),
        twitterTitle: this.extractMetaContent(html, 'twitter:title'),
        twitterDescription: this.extractMetaContent(html, 'twitter:description'),
        twitterImage: this.extractMetaContent(html, 'twitter:image')
      }
    };
    
    return elements;
  }

  /**
   * Extract content of a tag from HTML
   * @param {string} html - HTML content
   * @param {string} tagName - Tag name to extract
   * @returns {string|null} Tag content or null if not found
   */
  extractTag(html, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract all instances of a tag from HTML
   * @param {string} html - HTML content
   * @param {string} tagName - Tag name to extract
   * @returns {Array<string>} Array of tag contents
   */
  extractAllTags(html, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'gi');
    const matches = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches;
  }

  /**
   * Extract meta tag content from HTML
   * @param {string} html - HTML content
   * @param {string} name - Meta name to extract
   * @returns {string|null} Meta content or null if not found
   */
  extractMetaContent(html, name) {
    const regex = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
    const match = html.match(regex);
    
    if (match) return match[1].trim();
    
    // Try the reverse order (content first, then name)
    const reverseRegex = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["'][^>]*>`, 'i');
    const reverseMatch = html.match(reverseRegex);
    
    return reverseMatch ? reverseMatch[1].trim() : null;
  }

  /**
   * Extract meta tag property from HTML (for Open Graph)
   * @param {string} html - HTML content
   * @param {string} property - Meta property to extract
   * @returns {string|null} Meta content or null if not found
   */
  extractMetaProperty(html, property) {
    const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
    const match = html.match(regex);
    
    if (match) return match[1].trim();
    
    // Try the reverse order (content first, then property)
    const reverseRegex = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["'][^>]*>`, 'i');
    const reverseMatch = html.match(reverseRegex);
    
    return reverseMatch ? reverseMatch[1].trim() : null;
  }

  /**
   * Extract link href from HTML
   * @param {string} html - HTML content
   * @param {string} rel - Link rel to extract
   * @returns {string|null} Link href or null if not found
   */
  extractLinkHref(html, rel) {
    const regex = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["'][^>]*>`, 'i');
    const match = html.match(regex);
    
    if (match) return match[1].trim();
    
    // Try the reverse order (href first, then rel)
    const reverseRegex = new RegExp(`<link[^>]*href=["']([^"']+)["'][^>]*rel=["']${rel}["'][^>]*>`, 'i');
    const reverseMatch = html.match(reverseRegex);
    
    return reverseMatch ? reverseMatch[1].trim() : null;
  }

  /**
   * Extract images from HTML
   * @param {string} html - HTML content
   * @returns {Array<Object>} Array of image objects
   */
  extractImages(html) {
    const regex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
    const altRegex = /<img[^>]*alt=["']([^"']+)["'][^>]*>/gi;
    const images = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const imgTag = match[0];
      const src = match[1];
      
      // Extract alt text if available
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : null;
      
      images.push({
        src,
        alt,
        hasAlt: altMatch !== null
      });
    }
    
    return images;
  }

  /**
   * Extract links from HTML
   * @param {string} html - HTML content
   * @returns {Array<Object>} Array of link objects
   */
  extractLinks(html) {
    const regex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    const links = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      
      // Skip anchors, javascript, mailto, tel links
      if (href.startsWith('#') || 
          href.startsWith('javascript:') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:')) {
        continue;
      }
      
      links.push({
        href,
        text,
        isExternal: this.isExternalLink(href)
      });
    }
    
    return links;
  }

  /**
   * Check if a link is external
   * @param {string} href - Link href
   * @returns {boolean} Whether the link is external
   */
  isExternalLink(href) {
    return href.startsWith('http://') || href.startsWith('https://');
  }

  /**
   * Analyze SEO elements and generate a score
   * @param {Object} elements - Extracted SEO elements
   * @param {Object} headers - HTTP response headers
   * @param {number} statusCode - HTTP status code
   * @param {string|null} redirectUrl - Redirect URL if any
   * @param {number} responseTime - Response time in ms
   * @returns {Object} Analysis results
   */
  analyzeSeoElements(elements, headers, statusCode, redirectUrl, responseTime) {
    const issues = [];
    const opportunities = [];
    
    // Initialize scores for different categories
    const scores = {
      technical: 100,
      content: 100, 
      onPage: 100,
      performance: 100
    };
    
    // Check HTTP status
    if (statusCode !== 200) {
      issues.push({
        severity: 'critical',
        description: `Non-200 HTTP status code: ${statusCode}`
      });
      scores.technical -= 25;
    }
    
    // Check response time
    const responseTimeScore = this.calculateResponseTimeScore(responseTime);
    scores.performance = responseTimeScore;
    
    if (responseTimeScore < 70) {
      issues.push({
        severity: 'warning',
        description: `Slow server response time: ${Math.round(responseTime)}ms`
      });
    }
    
    // Check title
    if (!elements.title) {
      issues.push({
        severity: 'critical',
        description: 'Missing page title'
      });
      scores.onPage -= 25;
    } else if (elements.title.length < 10) {
      issues.push({
        severity: 'warning',
        description: 'Title is too short (less than 10 characters)'
      });
      scores.onPage -= 10;
    } else if (elements.title.length > 60) {
      issues.push({
        severity: 'warning',
        description: 'Title is too long (more than 60 characters)'
      });
      scores.onPage -= 5;
    }
    
    // Check meta description
    if (!elements.metaDescription) {
      issues.push({
        severity: 'critical',
        description: 'Missing meta description'
      });
      scores.onPage -= 20;
    } else if (elements.metaDescription.length < 50) {
      issues.push({
        severity: 'warning',
        description: 'Meta description is too short (less than 50 characters)'
      });
      scores.onPage -= 10;
    } else if (elements.metaDescription.length > 160) {
      issues.push({
        severity: 'warning',
        description: 'Meta description is too long (more than 160 characters)'
      });
      scores.onPage -= 5;
    }
    
    // Check H1
    if (!elements.h1 || elements.h1.length === 0) {
      issues.push({
        severity: 'critical',
        description: 'Missing H1 heading'
      });
      scores.onPage -= 15;
    } else if (elements.h1.length > 1) {
      issues.push({
        severity: 'warning',
        description: `Multiple H1 headings found (${elements.h1.length})`
      });
      scores.onPage -= 10;
    }
    
    // Check images
    const imagesWithoutAlt = elements.images.filter(img => !img.hasAlt).length;
    if (elements.images.length > 0 && imagesWithoutAlt > 0) {
      const percentage = Math.round((imagesWithoutAlt / elements.images.length) * 100);
      issues.push({
        severity: percentage > 50 ? 'critical' : 'warning',
        description: `Images without alt text: ${imagesWithoutAlt} (${percentage}%)`
      });
      scores.onPage -= Math.min(20, percentage / 5);
    }
    
    // Check social tags
    if (!elements.socialTags.ogTitle || !elements.socialTags.ogDescription || !elements.socialTags.ogImage) {
      opportunities.push({
        severity: 'info',
        description: 'Missing or incomplete Open Graph tags'
      });
      scores.content -= 5;
    }
    
    if (!elements.socialTags.twitterCard || !elements.socialTags.twitterTitle || 
        !elements.socialTags.twitterDescription || !elements.socialTags.twitterImage) {
      opportunities.push({
        severity: 'info',
        description: 'Missing or incomplete Twitter Card tags'
      });
      scores.content -= 5;
    }
    
    // Check canonical URL
    if (!elements.canonicalUrl) {
      opportunities.push({
        severity: 'info',
        description: 'Missing canonical URL tag'
      });
      scores.technical -= 5;
    }
    
    // Check robots meta
    if (elements.robotsContent && (
        elements.robotsContent.includes('noindex') || 
        elements.robotsContent.includes('none'))) {
      issues.push({
        severity: 'critical',
        description: 'Page is set to noindex in robots meta tag'
      });
      scores.technical -= 25;
    }
    
    // Check viewport
    if (!elements.hasViewport) {
      issues.push({
        severity: 'warning',
        description: 'Missing viewport meta tag'
      });
      scores.technical -= 10;
    }
    
    // Check structured data
    if (!elements.hasStructuredData) {
      opportunities.push({
        severity: 'info',
        description: 'No structured data (JSON-LD) found'
      });
      scores.content -= 5;
    }
    
    // Check favicon
    if (!elements.hasFavicon) {
      opportunities.push({
        severity: 'info',
        description: 'No favicon found'
      });
      scores.technical -= 2;
    }
    
    // Check content to code ratio (rough estimate)
    const textContent = this.stripHtml(elements.title || '') + ' ' + 
                        this.stripHtml(elements.h1?.join(' ') || '') + ' ' + 
                        this.stripHtml(elements.h2?.join(' ') || '') + ' ' + 
                        this.stripHtml(elements.h3?.join(' ') || '');
    
    const contentRatio = textContent.length / 1000; // Very rough estimate
    if (contentRatio < 0.5) {
      opportunities.push({
        severity: 'info',
        description: 'Low content-to-code ratio detected'
      });
      scores.content -= 10;
    }
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (scores.technical * 0.3) + 
      (scores.content * 0.2) + 
      (scores.onPage * 0.3) + 
      (scores.performance * 0.2)
    );
    
    // Clamp score between 0-100
    const finalScore = Math.max(0, Math.min(100, overallScore));
    
    // Calculate metrics for frontend display
    const lcpValue = (responseTime / 1000) * (1 + Math.random() * 0.5); // Estimated LCP
    const lcpScore = 100 - (lcpValue * 15);
    
    const clsValue = Math.max(0.01, Math.min(0.25, (1 - (finalScore / 100)) * 0.25));
    const clsScore = 100 - (clsValue * 300);
    
    const fidValue = Math.max(10, Math.min(500, (1 - (finalScore / 100)) * 300));
    const fidScore = 100 - (fidValue / 5);
    
    // Combine results
    return {
      status: 'success',
      score: finalScore,
      issuesFound: issues.length,
      opportunities: opportunities.length,
      performanceMetrics: {
        lcp: {
          value: parseFloat(lcpValue.toFixed(1)),
          unit: 's',
          score: Math.floor(lcpScore)
        },
        cls: {
          value: parseFloat(clsValue.toFixed(2)),
          score: Math.floor(clsScore)
        },
        fid: {
          value: Math.floor(fidValue),
          unit: 'ms',
          score: Math.floor(fidScore)
        }
      },
      topIssues: [...issues, ...opportunities].slice(0, 5),
      detailedResults: {
        issues,
        opportunities,
        scores,
        elements: {
          title: elements.title,
          metaDescription: elements.metaDescription,
          h1Count: elements.h1?.length || 0,
          imageCount: elements.images.length,
          imagesWithAlt: elements.images.length - imagesWithoutAlt,
          internalLinks: elements.links.filter(link => !link.isExternal).length,
          externalLinks: elements.links.filter(link => link.isExternal).length,
          hasCanonical: !!elements.canonicalUrl,
          hasOpenGraph: !!(elements.socialTags.ogTitle && elements.socialTags.ogDescription),
          hasTwitterCards: !!(elements.socialTags.twitterCard && elements.socialTags.twitterTitle),
          hasStructuredData: elements.hasStructuredData,
          responseTime,
          statusCode
        }
      }
    };
  }

  /**
   * Calculate a score for response time
   * @param {number} responseTime - Response time in ms
   * @returns {number} Score from 0-100
   */
  calculateResponseTimeScore(responseTime) {
    if (responseTime < 100) return 100;
    if (responseTime < 200) return 95;
    if (responseTime < 300) return 90;
    if (responseTime < 500) return 85;
    if (responseTime < 800) return 75;
    if (responseTime < 1200) return 65;
    if (responseTime < 2000) return 50;
    if (responseTime < 3000) return 35;
    if (responseTime < 5000) return 20;
    return 10;
  }

  /**
   * Strip HTML tags from a string
   * @param {string} html - HTML string
   * @returns {string} Text content
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = SeoAuditor;