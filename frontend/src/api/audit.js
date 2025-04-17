// Dedicated audit endpoint with JSON body parsing
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }

  try {
    // Get URL from request body
    let url = '';
    
    // Parse request body
    if (req.body) {
      if (typeof req.body === 'string') {
        try {
          const parsedBody = JSON.parse(req.body);
          url = parsedBody.url;
        } catch (e) {
          console.error('Failed to parse JSON string body:', e);
        }
      } else if (typeof req.body === 'object') {
        url = req.body.url;
      }
    }
    
    // Check if URL exists
    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required'
      });
    }
    
    // Normalize URL
    let cleanUrl = url;
    if (!url.startsWith('http')) {
      cleanUrl = 'https://' + url;
    }
    
    console.log(`Processing audit for: ${cleanUrl}`);
    
    // Generate score based on domain
    let score = 78;
    try {
      const domain = new URL(cleanUrl).hostname;
      const sum = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      score = 65 + (sum % 35);
    } catch (e) {
      console.error('Error parsing domain:', e);
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