export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    body: req.body
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Only include error details in development
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
      path: req.path
    })
  });
};