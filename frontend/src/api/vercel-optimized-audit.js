// Optimized audit endpoint specifically designed for Vercel serverless functions
const LightweightCrawler = require('./lightweight-crawler');

module.exports = async (req, res) => {
  // Send CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('Received audit request:', req.method);
  console.log('Request headers:', req.headers);
  
  // Extract URL from request (both GET and POST supported)
  let url = '';
  
  try {
    if (req.method === 'GET') {
      // Get URL from query parameter
      url = req.query.url;
      console.log('Extracted URL from query:', url);
    } else if (req.method === 'POST') {
      // Get URL from request body
      if (typeof req.body === 'string') {
        try {
          const parsedBody = JSON.parse(req.body);
          url = parsedBody.url;
        } catch (error) {
          console.error('Failed to parse JSON body:', error);
        }
      } else if (req.body && typeof req.body === 'object') {
        url = req.body.url;
      }
      console.log('Extracted URL from body:', url);
    }
    
    // Validate URL
    if (!url) {
      console.log('No URL provided');
      return res.status(400).json({
        status: 'error',
        message: 'URL is required'
      });
    }
    
    // Create crawler instance
    console.log('Creating crawler instance for:', url);
    const crawler = new LightweightCrawler({
      maxPages: 3,  // Limited for Vercel serverless
      timeout: 8000 // Short timeout to avoid Vercel function timeout
    });
    
    // Start the audit with a safety timeout
    console.log('Starting audit');
    const auditPromise = crawler.audit(url);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Audit timed out after 25 seconds'));
      }, 25000); // 25 second total timeout
    });
    
    // Race between audit and timeout
    const auditResult = await Promise.race([
      auditPromise,
      timeoutPromise
    ]);
    
    console.log('Audit completed successfully');
    
    // Send successful response
    return res.status(200).json(auditResult);
    
  } catch (error) {
    console.error('Error during audit execution:', error);
    
    return res.status(500).json({
      status: 'error',
      message: `Audit failed: ${error.message}`,
      url: url
    });
  }
};