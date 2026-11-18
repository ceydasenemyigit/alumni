/**
 * 404 Guardian Middleware
 * Catches unhandled routes and returns 404 errors with a specific reason.
 * Supports content negotiation: structured JSON for API/JSON clients and generic 404 HTML view for browsers.
 */

function notFoundGuardian(req, res, next) {
  const method = req.method;
  const path = req.originalUrl || req.url;
  const reason = `The requested route '${method} ${path}' does not exist on this server. Check /api/swagger for available endpoints.`;

  res.status(404);

  // If request asks for HTML and is not an API prefix
  if (req.accepts('html') && !path.startsWith('/api/')) {
    return res.render('404', {
      title: '404 - Page Not Found',
      reason: `The page '${path}' could not be found on this platform.`,
      path,
      method
    });
  }

  // Default to JSON response with detailed error reason
  return res.json({
    success: false,
    status: 404,
    error: 'Not Found',
    reason,
    path,
    method,
    timestamp: new Date().toISOString()
  });
}

module.exports = notFoundGuardian;
