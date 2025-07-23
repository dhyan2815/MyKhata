// Middleware to handle 404 Not Found errors
const notFound = (req, res, next) => {
  // Create a new error with the requested URL
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404); // Set status to 404
  next(error); // Pass error to next middleware
};

// General error handling middleware
const errorHandler = (err, req, res, next) => {
  // If status code is 200 (OK), set it to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message, // Send error message
    // Show stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };