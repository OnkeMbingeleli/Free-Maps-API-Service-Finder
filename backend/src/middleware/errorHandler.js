// Centralized error handler — keeps stack traces out of API responses
// and gives us one place to hook in monitoring alerts (§12C).
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}
