import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  const checkApiHealth = async () => {
    try {
      setApiStatus('Loading...');
      const response = await fetch('/api/health');
      const data = await response.json();
      setApiStatus(`API is ${data.status}, timestamp: ${data.timestamp}`);
    } catch (error) {
      setApiStatus(`Error connecting to API: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (error) {
      setError(`Failed to start audit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="logo">Marden SEO Audit</div>
      
      <button onClick={checkApiHealth}>Check API Status</button>
      {apiStatus && <div className="card">{apiStatus}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Starting Audit...' : 'Start SEO Audit'}
        </button>
      </form>
      
      {error && (
        <div className="card" style={{ backgroundColor: '#ffeeee' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="card">
          <h3>Audit Started</h3>
          <p>Job ID: {result.job.id}</p>
          <p>Status: {result.job.status}</p>
          <p>URL: {result.job.url}</p>
          <p>Created: {result.job.createdAt}</p>
        </div>
      )}
    </div>
  );
}

export default App;
