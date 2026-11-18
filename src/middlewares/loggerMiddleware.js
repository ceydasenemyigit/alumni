/**
 * Logger Middleware
 * Writes access logs to the terminal.
 * Format: time method route res. type duration
 * Example: 10:20:30 post /api/jobs 201 json 18ms
 */

function formatTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}:${m}:${s}`;
}

function resolveResponseType(res) {
  const contentType = res.get('Content-Type') || '';
  if (contentType.includes('application/json')) return 'json';
  if (contentType.includes('text/html')) return 'html';
  if (contentType.includes('text/plain')) return 'text';
  if (contentType.includes('javascript')) return 'js';
  if (contentType.includes('css')) return 'css';
  if (contentType.includes('image')) return 'image';
  if (contentType) return contentType.split(';')[0].trim();
  return '-';
}

function loggerMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const time = formatTime();
    const method = req.method.toLowerCase();
    const route = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const resType = resolveResponseType(res);
    const duration = `${Date.now() - startTime}ms`;

    // Terminal row: time method route res. type duration
    console.log(`${time} ${method} ${route} ${statusCode} ${resType} ${duration}`);
  });

  next();
}

module.exports = loggerMiddleware;
