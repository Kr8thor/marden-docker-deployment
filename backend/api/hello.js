// Simple endpoint for testing
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from the Marden API!'
  });
};
