const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

module.exports = errorHandler;
