const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/health') {
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Backend is running successfully!',
      version: '1.0.0'
    }));
  } else {
    res.end(JSON.stringify({
      status: 'ok',
      message: 'MardenSEO Audit Tool API',
      endpoints: ['/api/health', '/api/audit']
    }));
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
