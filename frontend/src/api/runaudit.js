// GET-based audit endpoint that uses query parameters
module.exports = (req, res) => {
  // Enable CORS with more comprehensive headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed - use GET'
    });
  }
  
  try {
    // Extract URL from query parameters - add detailed logging
    const url = req.query.url;
    
    console.log('Received audit request with query:', req.query);
    console.log('Extracted URL:', url);
    
    // Validate URL
    if (!url) {
      console.log('No URL provided in query parameters');
      return res.status(400).json({
        status: 'error',
        message: 'URL is required as a query parameter'
      });
    }
    
    // Normalize URL
    let cleanUrl = url;
    if (!url.startsWith('http')) {
      cleanUrl = 'https://' + url;
    }
    
    // Generate a score based on domain name
    let score = 78;
    try {
      const domain = new URL(cleanUrl).hostname;
      const sum = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      score = 65 + (sum % 35); // Score between 65-100
    } catch (e) {
      console.error('URL parsing error:', e);
    }
    
    // Generate metrics based on score
    const lcpValue = parseFloat((3.5 - (score / 50)).toFixed(1));
    const lcpScore = Math.floor(100 - (lcpValue * 20));
    
    const clsValue = parseFloat((0.3 - (score / 1000)).toFixed(2));
    const clsScore = Math.floor(100 - (clsValue * 300));
    
    const fidValue = Math.floor(300 - (score * 2));
    const fidScore = Math.floor(100 - (fidValue / 4));
    
    const issuesFound = Math.floor(25 - (score / 5));
    const opportunities = Math.floor(10 - (score / 10));
    
    // Create mock audit result
    const auditResult = {
      url: cleanUrl,
      score: score,
      status: 'success',
      issuesFound: issuesFound,
      opportunities: opportunities,
      performanceMetrics: {
        lcp: {
          value: lcpValue,
          unit: 's',
          score: lcpScore,
        },
        cls: {
          value: clsValue,
          score: clsScore,
        },
        fid: {
          value: fidValue,
          unit: 'ms',
          score: fidScore,
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
    };
    
    // Add some randomness to make each audit unique
    if (score < 75) {
      auditResult.topIssues.push({
        severity: 'critical',
        description: 'Slow page load times on mobile',
      });
      
      auditResult.topIssues.push({
        severity: 'warning',
        description: 'Missing robots.txt file',
      });
    }
    
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