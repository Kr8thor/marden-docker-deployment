// Root API endpoint for Vercel
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return API information
  res.status(200).json({
    status: 'ok',
    message: 'Marden SEO Audit API',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Health check endpoint'
      },
      {
        path: '/api/audit',
        method: 'POST',
        description: 'Start an SEO audit',
        body: {
          url: 'URL to audit (required)'
        }
      }
    ]
  });
};
