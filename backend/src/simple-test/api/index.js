// Simple API to test Upstash Redis connection
const { Redis } = require('@upstash/redis');

module.exports = async (req, res) => {
  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test Redis connection
    await redis.set('test-key', 'Connection successful');
    const testValue = await redis.get('test-key');

    res.status(200).json({
      status: 'ok',
      message: 'Redis connection successful',
      testValue,
      redis_url: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 15) + '...',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Redis connection failed',
      error: error.message,
      stack: error.stack,
      redis_url_exists: !!process.env.UPSTASH_REDIS_REST_URL,
      redis_token_exists: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
};
