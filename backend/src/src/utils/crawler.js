import puppeteer from 'puppeteer';
import url from 'url';
import { nanoid } from 'nanoid';
import config from '../config/index.js';
import logger from './logger.js';

/**
 * Web crawler utility for SEO audits
 */
class Crawler {
  constructor(options = {}) {
    this.options = {
      maxPages: options.maxPages || config.crawler.maxPages,
      depth: options.depth || config.crawler.depth,
      timeout: options.timeout || config.crawler.timeout,
      userAgent: options.userAgent || config.crawler.userAgent,
      ignoreRobotsTxt: options.ignoreRobotsTxt || false,
      followRedirects: options.followRedirects !== false,
      ...options,
    };
    
    this.browser = null;
    this.visitedUrls = new Set();
    this.queue = [];
    this.results = {};
    this.baseUrl = null;
    this.baseHostname = null;
    this.robotsTxtRules = null;
    this.sitemapUrls = [];
  }
  
  /**
   * Initialize the crawler
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      logger.debug('Crawler browser initialized');
    } catch (error) {
      logger.error('Failed to initialize crawler browser:', error);
      throw error;
    }
  }
  
  /**
   * Clean up resources
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.debug('Crawler browser closed');
    }
  }
  
  /**
   * Start crawling from a URL
   * @param {string} startUrl - URL to start crawling
   * @returns {Promise<Object>} Crawl results
   */
  async crawl(startUrl) {
    try {
      const startTime = Date.now();
      
      // Parse and normalize the starting URL
      const parsedUrl = new URL(startUrl);
      this.baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
      this.baseHostname = parsedUrl.hostname;
      
      logger.info(`Starting crawl of ${startUrl}`, { 
        baseUrl: this.baseUrl,
        options: this.options,
      });
      
      // Initialize browser if not already done
      if (!this.browser) {
        await this.initialize();
      }
      
      // Reset state
      this.visitedUrls.clear();
      this.queue = [{ url: startUrl, depth: 0 }];
      this.results = {};
      
      // Get robots.txt first if needed
      if (!this.options.ignoreRobotsTxt) {
        await this.fetchRobotsTxt();
      }
      
      // Process queue until empty or max pages reached
      while (
        this.queue.length > 0 && 
        this.visitedUrls.size < this.options.maxPages
      ) {
        const { url: nextUrl, depth } = this.queue.shift();
        
        if (this.shouldCrawl(nextUrl, depth)) {
          await this.crawlPage(nextUrl, depth);
        }
      }
      
      const duration = Date.now() - startTime;
      
      logger.info(`Crawl completed in ${duration}ms`, {
        pagesVisited: this.visitedUrls.size,
        duration,
      });
      
      // Return crawl results
      return {
        baseUrl: this.baseUrl,
        pagesVisited: this.visitedUrls.size,
        duration,
        pages: this.results,
        sitemapUrls: this.sitemapUrls,
      };
    } catch (error) {
      logger.error(`Error during crawl of ${startUrl}:`, error);
      throw error;
    } finally {
      // Ensure browser is closed
      await this.close();
    }
  }
  
  /**
   * Fetch and parse robots.txt
   * @returns {Promise<void>}
   */
  async fetchRobotsTxt() {
    try {
      const robotsUrl = `${this.baseUrl}/robots.txt`;
      
      logger.debug(`Fetching robots.txt from ${robotsUrl}`);
      
      const page = await this.browser.newPage();
      await this.setupPage(page);
      
      try {
        const response = await page.goto(robotsUrl, {
          waitUntil: 'networkidle2',
          timeout: this.options.timeout,
        });
        
        if (response.ok()) {
          const content = await page.content();
          
          // Basic robots.txt parsing
          this.parseRobotsTxt(await response.text());
          
          // Look for sitemap references
          const sitemapMatches = content.match(/Sitemap: (.*?)($|\n)/g);
          
          if (sitemapMatches && sitemapMatches.length > 0) {
            const sitemapUrls = sitemapMatches.map(match => {
              return match.replace('Sitemap:', '').trim();
            });
            
            this.sitemapUrls = sitemapUrls;
            logger.debug(`Found ${sitemapUrls.length} sitemaps in robots.txt`, { sitemapUrls });
          }
        } else {
          logger.warn(`Failed to fetch robots.txt: ${response.status()}`);
        }
      } catch (error) {
        logger.warn(`Error fetching robots.txt: ${error.message}`);
      } finally {
        await page.close();
      }
    } catch (error) {
      logger.error('Error processing robots.txt:', error);
    }
  }
  
  /**
   * Parse robots.txt content
   * @param {string} content - Content of robots.txt file
   */
  parseRobotsTxt(content) {
    // Simple parsing of disallow rules for our user agent
    // A more comprehensive parser would be used in production
    
    const lines = content.split('\\n');
    let currentUserAgent = null;
    const rules = {
      userAgentRules: {},
      sitemaps: [],
    };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        continue;
      }
      
      if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
        currentUserAgent = trimmedLine.split(':')[1].trim();
        if (!rules.userAgentRules[currentUserAgent]) {
          rules.userAgentRules[currentUserAgent] = {
            allow: [],
            disallow: [],
          };
        }
      } else if (currentUserAgent && trimmedLine.toLowerCase().startsWith('disallow:')) {
        const path = trimmedLine.split(':')[1].trim();
        if (path) {
          rules.userAgentRules[currentUserAgent].disallow.push(path);
        }
      } else if (currentUserAgent && trimmedLine.toLowerCase().startsWith('allow:')) {
        const path = trimmedLine.split(':')[1].trim();
        if (path) {
          rules.userAgentRules[currentUserAgent].allow.push(path);
        }
      } else if (trimmedLine.toLowerCase().startsWith('sitemap:')) {
        const sitemapUrl = trimmedLine.split(':').slice(1).join(':').trim();
        rules.sitemaps.push(sitemapUrl);
      }
    }
    
    this.robotsTxtRules = rules;
    logger.debug('Parsed robots.txt rules', { rules });
  }
  
  /**
   * Check if a URL should be crawled based on rules and settings
   * @param {string} url - URL to check
   * @param {number} depth - Current crawl depth
   * @returns {boolean} Whether the URL should be crawled
   */
  shouldCrawl(url, depth) {
    // Don't revisit URLs
    if (this.visitedUrls.has(url)) {
      return false;
    }
    
    // Check depth limit
    if (depth > this.options.depth) {
      return false;
    }
    
    try {
      const parsedUrl = new URL(url);
      
      // Only crawl the same hostname
      if (parsedUrl.hostname !== this.baseHostname) {
        return false;
      }
      
      // Skip non-http(s) URLs
      if (!parsedUrl.protocol.startsWith('http')) {
        return false;
      }
      
      // Skip URL fragments
      if (parsedUrl.hash && parsedUrl.pathname + parsedUrl.search === this.lastPathname) {
        return false;
      }
      
      // Check robots.txt rules if available
      if (this.robotsTxtRules && !this.options.ignoreRobotsTxt) {
        const path = parsedUrl.pathname + parsedUrl.search;
        
        // Check our specific user agent rules
        const ourRules = this.robotsTxtRules.userAgentRules[this.options.userAgent];
        
        // Check generic * rules
        const genericRules = this.robotsTxtRules.userAgentRules['*'];
        
        const isAllowedByOurRules = this.isAllowedByRules(path, ourRules);
        const isAllowedByGenericRules = this.isAllowedByRules(path, genericRules);
        
        // If we have specific rules, use those; otherwise fall back to generic rules
        if (ourRules && isAllowedByOurRules !== null) {
          return isAllowedByOurRules;
        } else if (genericRules && isAllowedByGenericRules !== null) {
          return isAllowedByGenericRules;
        }
      }
      
      return true;
    } catch (error) {
      logger.warn(`Invalid URL encountered: ${url}`, { error: error.message });
      return false;
    }
  }
  
  /**
   * Check if a path is allowed by robots.txt rules
   * @param {string} path - URL path to check
   * @param {Object} rules - Rules for a user agent
   * @returns {boolean|null} Whether path is allowed, or null if no rules match
   */
  isAllowedByRules(path, rules) {
    if (!rules) return null;
    
    // No rules means everything is allowed
    if (rules.allow.length === 0 && rules.disallow.length === 0) {
      return true;
    }
    
    let isDisallowed = false;
    
    // Check disallow rules first
    for (const rule of rules.disallow) {
      if (path.startsWith(rule)) {
        isDisallowed = true;
        break;
      }
    }
    
    // Allow rules override disallow rules
    if (isDisallowed) {
      for (const rule of rules.allow) {
        if (path.startsWith(rule)) {
          return true;
        }
      }
      return false;
    }
    
    return true;
  }
  
  /**
   * Crawl a single page and extract data
   * @param {string} url - URL to crawl
   * @param {number} depth - Current crawl depth
   * @returns {Promise<void>}
   */
  async crawlPage(url, depth) {
    const pageId = nanoid();
    const pageData = {
      id: pageId,
      url,
      depth,
      status: null,
      title: null,
      description: null,
      h1: null,
      headings: {},
      links: [],
      images: [],
      statusCode: null,
      redirect: null,
      contentType: null,
      loadTime: null,
      crawledAt: new Date().toISOString(),
      metrics: {},
      seoData: {},
    };
    
    // Mark as visited early to prevent duplicates in queue
    this.visitedUrls.add(url);
    
    logger.debug(`Crawling page: ${url}`, { depth, pageId });
    
    try {
      const page = await this.browser.newPage();
      await this.setupPage(page);
      
      const startTime = Date.now();
      
      // Navigate to the page
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.options.timeout,
      });
      
      const loadTime = Date.now() - startTime;
      pageData.loadTime = loadTime;
      
      // Handle status code and redirects
      if (response) {
        pageData.statusCode = response.status();
        pageData.contentType = response.headers()['content-type'] || null;
        
        if (response.url() !== url) {
          pageData.redirect = response.url();
        }
      } else {
        pageData.statusCode = 0;
        pageData.status = 'error';
      }
      
      // Don't extract content for non-HTML responses or error pages
      if (
        !pageData.contentType || 
        !pageData.contentType.includes('text/html') ||
        pageData.statusCode >= 400
      ) {
        logger.debug(`Skipping non-HTML content: ${url}`, {
          contentType: pageData.contentType,
          statusCode: pageData.statusCode,
        });
        
        this.results[pageId] = pageData;
        await page.close();
        return;
      }
      
      // Extract page content
      pageData.title = await page.title();
      
      // Extract meta description
      pageData.description = await page.evaluate(() => {
        const metaDescription = document.querySelector('meta[name="description"]');
        return metaDescription ? metaDescription.getAttribute('content') : null;
      });
      
      // Extract headings
      const headings = await page.evaluate(() => {
        const result = {};
        for (let i = 1; i <= 6; i++) {
          const elements = document.querySelectorAll(`h${i}`);
          result[`h${i}`] = Array.from(elements).map(el => ({
            text: el.innerText.trim(),
            id: el.id || null,
          }));
        }
        return result;
      });
      
      pageData.headings = headings;
      pageData.h1 = headings.h1 && headings.h1.length > 0 ? headings.h1[0].text : null;
      
      // Extract links
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(link => ({
          url: link.href,
          text: link.innerText.trim(),
          rel: link.getAttribute('rel') || null,
          target: link.getAttribute('target') || null,
          isExternal: link.hostname !== window.location.hostname,
        }));
      });
      
      pageData.links = links;
      
      // Extract images
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt || null,
          width: img.width || null, 
          height: img.height || null,
          loading: img.getAttribute('loading') || null,
        }));
      });
      
      pageData.images = images;
      
      // Extract SEO-specific data
      const seoData = await page.evaluate(() => {
        return {
          canonical: (() => {
            const link = document.querySelector('link[rel="canonical"]');
            return link ? link.href : null;
          })(),
          robots: (() => {
            const meta = document.querySelector('meta[name="robots"]');
            return meta ? meta.getAttribute('content') : null;
          })(),
          ogTags: (() => {
            const result = {};
            const tags = document.querySelectorAll('meta[property^="og:"]');
            tags.forEach(tag => {
              const property = tag.getAttribute('property');
              result[property] = tag.getAttribute('content');
            });
            return result;
          })(),
          twitterTags: (() => {
            const result = {};
            const tags = document.querySelectorAll('meta[name^="twitter:"]');
            tags.forEach(tag => {
              const name = tag.getAttribute('name');
              result[name] = tag.getAttribute('content');
            });
            return result;
          })(),
          structuredData: (() => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            return Array.from(scripts).map(script => {
              try {
                return JSON.parse(script.textContent);
              } catch (e) {
                return { error: "Invalid JSON" };
              }
            });
          })(),
          hreflangTags: (() => {
            const links = document.querySelectorAll('link[rel="alternate"][hreflang]');
            return Array.from(links).map(link => ({
              href: link.href,
              hreflang: link.getAttribute('hreflang'),
            }));
          })(),
          ampLink: (() => {
            const link = document.querySelector('link[rel="amphtml"]');
            return link ? link.href : null;
          })(),
        };
      });
      
      pageData.seoData = seoData;
      
      // Basic performance metrics
      const metrics = await page.evaluate(() => {
        if (!window.performance) return {};
        
        const timing = window.performance.timing;
        
        if (!timing) return {};
        
        const navigationStart = timing.navigationStart;
        
        return {
          ttfb: timing.responseStart - navigationStart,
          domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
          domComplete: timing.domComplete - navigationStart,
          load: timing.loadEventEnd - navigationStart,
        };
      });
      
      pageData.metrics = metrics;
      
      // Add page to results
      this.results[pageId] = pageData;
      
      // Extract new URLs to crawl
      for (const link of links) {
        if (!link.isExternal && this.shouldCrawl(link.url, depth + 1)) {
          this.queue.push({ url: link.url, depth: depth + 1 });
        }
      }
      
      await page.close();
      
      logger.debug(`Completed crawling page: ${url}`, { 
        statusCode: pageData.statusCode,
        links: links.length, 
      });
    } catch (error) {
      logger.error(`Error crawling ${url}:`, error);
      
      pageData.status = 'error';
      pageData.error = {
        message: error.message,
        stack: error.stack,
      };
      
      this.results[pageId] = pageData;
    }
  }
  
  /**
   * Set up page with required settings
   * @param {Object} page - Puppeteer page object
   * @returns {Promise<void>}
   */
  async setupPage(page) {
    await page.setUserAgent(this.options.userAgent);
    
    // Set viewport size
    await page.setViewport({
      width: 1280,
      height: 800,
    });
    
    // Set timeout
    page.setDefaultNavigationTimeout(this.options.timeout);
    
    // Abort requests for unnecessary resources to speed up crawling
    await page.setRequestInterception(true);
    
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      
      if (
        resourceType === 'image' ||
        resourceType === 'stylesheet' ||
        resourceType === 'font' ||
        resourceType === 'media'
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }
}

export default Crawler;
