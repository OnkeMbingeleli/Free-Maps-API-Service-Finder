// Minimal in-memory request/error counters. Swap for Prometheus client
// in production if you need real dashboards.
const metrics = { requests: 0, errors: 0 };

export function trackRequest(req, res, next) {
  metrics.requests++;
  next();
}

export function trackError() {
  metrics.errors++;
}

export function getMetrics() {
  return { ...metrics };
}
