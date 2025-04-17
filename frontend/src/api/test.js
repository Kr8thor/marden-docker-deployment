// Simple test endpoint to debug request handling
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return all request info for debugging
  return res.status(200).json({
    status: 'ok',
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    bodyType: typeof req.body,
    query: req.query,
    rawBody: req.rawBody ? '(present)' : '(not present)',
    timestamp: new Date().toISOString()
  });
};