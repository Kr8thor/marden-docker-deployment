// Extremely simplified API for testing JSON parsing
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For POST requests
  if (req.method === 'POST') {
    let parsedUrl = null;
    
    console.log('Received body type:', typeof req.body);
    
    // Try to extract URL from various body formats
    try {
      if (req.body) {
        if (typeof req.body === 'string') {
          try {
            const parsed = JSON.parse(req.body);
            parsedUrl = parsed.url;
          } catch (e) {
            console.error('Failed to parse JSON string:', e);
          }
        } else if (typeof req.body === 'object') {
          parsedUrl = req.body.url;
        }
      }
      
      // Return diagnostic info
      return res.status(200).json({
        received: true,
        bodyType: typeof req.body,
        bodyValue: req.body,
        parsedUrl: parsedUrl,
        headers: req.headers,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process request',
        error: error.message
      });
    }
  }
  
  // For GET requests
  return res.status(200).json({
    status: 'ok',
    message: 'Simple API endpoint',
    method: req.method,
    timestamp: new Date().toISOString()
  });
};