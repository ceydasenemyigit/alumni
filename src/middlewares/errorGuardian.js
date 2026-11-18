/**
 * 5xx Guardian & Error Logging Middleware
 * Intercepts uncaught exceptions, 5xx server errors, and logs them to logs/error.logs.
 * Returns structured error payloads with a clear reason.
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../../logs');
const ERROR_LOGS_FILE = path.join(LOGS_DIR, 'error.logs');
const ERROR_LOG_FILE = path.join(LOGS_DIR, 'error.log');

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function writeErrorLog(err, req, statusCode) {
  try {
    ensureLogsDir();
    const timestamp = new Date().toISOString();
    const method = req.method || 'UNKNOWN';
    const url = req.originalUrl || req.url || 'UNKNOWN';
    const reason = err.reason || err.message || 'Unknown internal error';

    const entry = [
      `[${timestamp}] [${statusCode}] ${method} ${url}`,
      `Error: ${err.message}`,
      `Reason: ${reason}`,
      `Stack: ${err.stack || 'No stack trace available'}`,
      `Body: ${JSON.stringify(req.body || {})}`,
      `Query: ${JSON.stringify(req.query || {})}`,
      `IP: ${req.ip || (req.connection && req.connection.remoteAddress) || '-'}`,
      '--------------------------------------------------------------------------------\n'
    ].join('\n');

    fs.appendFileSync(ERROR_LOGS_FILE, entry);
    // Also write to error.log for standard tool compatibility
    try {
      fs.appendFileSync(ERROR_LOG_FILE, entry);
    } catch (_) {}
  } catch (logErr) {
    console.error('Failed writing to logs/error.logs:', logErr.message);
  }
}

function errorGuardian(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const reason = err.reason || err.message || 'An unexpected internal server error occurred while processing the request.';

  // If server error (5xx) or unhandled error, persist to logs/error.logs
  if (statusCode >= 500) {
    writeErrorLog(err, req, statusCode);
  }

  res.status(statusCode);

  // Content negotiation: Render HTML if requested from browser and not /api/
  const isApi = (req.originalUrl || req.url || '').startsWith('/api/');
  if (req.accepts('html') && !isApi) {
    return res.render('error', {
      title: `${statusCode} - Server Error`,
      status: statusCode,
      message: statusCode >= 500 ? 'An unexpected server error occurred.' : err.message,
      reason
    });
  }

  // Structured JSON response with error and reason
  return res.json({
    success: false,
    status: statusCode,
    error: statusCode >= 500 ? 'Internal Server Error' : (err.name || 'Error'),
    message: err.message || 'An unexpected server error occurred.',
    reason,
    path: req.originalUrl || req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  errorGuardian,
  writeErrorLog,
  LOGS_DIR,
  ERROR_LOGS_FILE
};
