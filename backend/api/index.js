// Combined index and audit endpoints for Vercel serverless function
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Cache-Control');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For debugging - log the request details
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  
  // POST requests are for audit
  if (req.method === 'POST') {
    try {
      // Extract URL from request body with extra safety checks
      let requestBody = req.body;
      let url = null;
      
      // Handle different body formats
      if (requestBody) {
        if (typeof requestBody === 'object') {
          url = requestBody.url;
        } else if (typeof requestBody === 'string') {
          try {
            const parsed = JSON.parse(requestBody);
            url = parsed.url;
          } catch (e) {
            console.error('Failed to parse string body:', e);
          }
        }
      }
      
      console.log('Extracted URL:', url);
      
      // Validate URL
      if (!url) {
        return res.status(400).json({
          status: 'error',
          message: 'URL is required',
        });
      }
      
      // Generate a score that changes slightly for each domain
      let score = 78;
      try {
        // Clean URL for consistency
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        
        const domain = new URL(url).hostname;
        // Generate a score based on domain name
        const sum = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        score = 65 + (sum % 25); // Score between 65-90
      } catch (e) {
        console.error('URL parsing error:', e);
      }
      
      // Generate metrics based on score
      const lcpValue = (3.5 - (score / 50)).toFixed(1);
      const lcpScore = 100 - (Number(lcpValue) * 20);
      
      const clsValue = (0.3 - (score / 1000)).toFixed(2);
      const clsScore = 100 - (Number(clsValue) * 250);
      
      const fidValue = Math.floor(300 - (score * 2));
      const fidScore = 100 - (fidValue / 4);
      
      const issuesFound = Math.floor(25 - (score / 5));
      const opportunities = Math.floor(10 - (score / 10));
      
      // For demo/testing purposes we're returning enhanced mock results
      const mockAuditResult = {
        url: url,
        score: score,
        issuesFound: issuesFound,
        opportunities: opportunities,
        performanceMetrics: {
          lcp: {
            value: Number(lcpValue),
            unit: 's',
            score: Math.floor(lcpScore),
          },
          cls: {
            value: Number(clsValue),
            score: Math.floor(clsScore),
          },
          fid: {
            value: fidValue,
            unit: 'ms',
            score: Math.floor(fidScore),
          },
        },
        topIssues: [
          {
            severity: 'critical',
            description: 'Missing meta descriptions on 3 pages',
          },
          {
            severity: 'warning',
            description: 'Images without alt text',
          },
          {
            severity: 'info',
            description: 'Consider adding structured data',
          },
        ],
        // Additional top issues based on score
        ...(score < 75 && {
          topIssues: [
            {
              severity: 'critical',
              description: 'Missing meta descriptions on 3 pages',
            },
            {
              severity: 'critical',
              description: 'Slow page load times on mobile',
            },
            {
              severity: 'warning',
              description: 'Images without alt text',
            },
            {
              severity: 'warning',
              description: 'Missing robots.txt file',
            },
            {
              severity: 'info',
              description: 'Consider adding structured data',
            },
          ]
        })
      };
      
      // Set explicit content type
      res.setHeader('Content-Type', 'application/json');
      
      // Return success response with mock data
      return res.status(200).json(mockAuditResult);
    } catch (error) {
      // Handle errors
      console.error('Error handling audit request:', error);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process audit request',
        error: error.message,
      });
    }
  }
  
  // GET requests return API status
  return res.status(200).json({
    status: 'ok',
    message: 'Marden SEO Audit API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    note: 'POST to this same endpoint to run an audit with {"url":"your-website.com"}'
  });
};