// Real SEO audit endpoint that performs actual crawls
const SeoCrawler = require('./lib/crawler');

module.exports = async (req, res) => {
  // Enable CORS with comprehensive headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('Received audit request:', req.method);
  
  // Handle both GET and POST requests
  try {
    // Extract URL from query parameters (GET) or request body (POST)
    let url = '';
    
    if (req.method === 'GET') {
      url = req.query.url;
      console.log('URL from query parameters:', url);
    } else if (req.method === 'POST') {
      // Check for JSON body
      if (req.body) {
        if (typeof req.body === 'string') {
          try {
            const parsedBody = JSON.parse(req.body);
            url = parsedBody.url;
          } catch (e) {
            console.error('Failed to parse JSON body:', e);
          }
        } else if (typeof req.body === 'object') {
          url = req.body.url;
        }
      }
      console.log('URL from request body:', url);
    }
    
    // Validate URL
    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required (either as a query parameter or in the request body)'
      });
    }
    
    // Create a new crawler instance
    const crawler = new SeoCrawler({
      maxPages: 5,
      timeout: 25000, // 25 seconds - to stay within Vercel limits
      userAgent: 'MardenSEO Audit Bot v1.0'
    });
    
    console.log(`Starting SEO audit for: ${url}`);
    
    // Perform the actual audit with crawler
    const auditResult = await crawler.audit(url);
    
    console.log(`Audit completed successfully for: ${url}`);
    
    // Return the audit results
    return res.status(200).json(auditResult);
    
  } catch (error) {
    console.error('Error processing audit:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Error processing audit request',
      error: error.message
    });
  }
};