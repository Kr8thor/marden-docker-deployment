// Audit API endpoint for Vercel
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request for CORS preflight
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
  
  // Check for URL in request body
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      status: 'error',
      message: 'URL is required'
    });
  }
  
  // Create a mock job response
  const job = {
    id: Math.random().toString(36).substring(2, 15),
    url,
    status: 'queued',
    createdAt: new Date().toISOString()
  };
  
  // Return success response
  res.status(200).json({
    status: 'success',
    job
  });
};
