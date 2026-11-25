const crypto = require('crypto');
const userModel = require('../models/userModel');

const SECRET = process.env.SESSION_SECRET || 'alumni_jwt_hmac_secret_2026';

/**
 * Generate secure HMAC-SHA256 authenticated token (Zero external dependencies)
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and unpack token
 */
function verifyToken(tokenStr) {
  if (!tokenStr || typeof tokenStr !== 'string' || !tokenStr.includes('.')) {
    return null;
  }

  const parts = tokenStr.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');

  // Constant-time comparison against timing attacks
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Parse Cookie header safely into key-value map
 */
function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  const pairs = header.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  }
  return cookies;
}

/**
 * Session Middleware (Global Hydrator)
 * Runs globally in app.use() to populate req.user & res.locals.currentUser if token/cookie is present.
 * Does not block unauthenticated requests.
 */
async function sessionMiddleware(req, res, next) {
  // Attach cookie management helpers to res
  res.setAuthCookie = function (token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
  };

  res.clearAuthCookie = function () {
    res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  };

  let token = null;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Check Cookie header fallback
  if (!token && req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.auth_token) {
      token = cookies.auth_token;
    }
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.id) {
      const user = await userModel.findById(payload.id);
      req.user = user || payload;
      res.locals.currentUser = req.user;
      return next();
    }
  }

  req.user = null;
  res.locals.currentUser = null;
  next();
}

/**
 * Auth Middleware (Route Guard)
 * Strictly verifies authentication credentials (Bearer token or auth_token cookie).
 * If valid: passes to next().
 * If missing or invalid:
 *   - API (JSON): returns structured 401 Unauthorized with explicit reason.
 *   - Web (HTML): redirects to /login with originalUrl return redirect.
 */
async function authMiddleware(req, res, next) {
  // If user is already authenticated by sessionMiddleware
  if (req.user) {
    return next();
  }

  // Fallback: Check token in request headers/cookies directly
  let token = null;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.auth_token) {
      token = cookies.auth_token;
    }
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.id) {
      const user = await userModel.findById(payload.id);
      req.user = user || payload;
      res.locals.currentUser = req.user;
      return next();
    }
  }

  // Request is unauthenticated
  const currentUrl = req.originalUrl || req.url || '';
  const isApi = currentUrl.startsWith('/api') || (req.baseUrl && req.baseUrl.startsWith('/api')) || req.path.startsWith('/api') || !req.accepts('html') || (req.headers['accept'] && req.headers['accept'].includes('application/json'));

  if (isApi) {
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      reason: 'Missing, expired, or invalid authentication token. Please authenticate via /api/auth/login or supply a valid Authorization: Bearer <token> header.',
      path: req.originalUrl || req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl || '/')}`);
}

/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * Ensures the authenticated user possesses one of the required roles (e.g. 'ADMIN', 'ALUMNI').
 * Returns structured 403 Forbidden with reason if unauthorized.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // If not authenticated yet, invoke authMiddleware first
    if (!req.user) {
      return authMiddleware(req, res, () => {
        validateRole(req, res, next, allowedRoles);
      });
    }
    validateRole(req, res, next, allowedRoles);
  };
}

function validateRole(req, res, next, allowedRoles) {
  const userRole = (req.user && req.user.role) ? req.user.role : '';

  if (!allowedRoles.includes(userRole)) {
    const currentUrl = req.originalUrl || req.url || '';
    const isApi = currentUrl.startsWith('/api') || (req.baseUrl && req.baseUrl.startsWith('/api')) || req.path.startsWith('/api') || !req.accepts('html') || (req.headers['accept'] && req.headers['accept'].includes('application/json'));
    const reason = `Access denied. Your role '${userRole || 'UNKNOWN'}' does not possess required clearance. Allowed role(s): ${allowedRoles.join(', ')}.`;

    if (isApi) {
      return res.status(403).json({
        success: false,
        status: 403,
        error: 'Forbidden',
        reason,
        path: req.originalUrl || req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(403).render('error', {
      title: '403 - Forbidden',
      message: reason
    });
  }

  next();
}

// Attach sub-methods for both functional and object-style usage
authMiddleware.authMiddleware = authMiddleware;
authMiddleware.requireAuth = authMiddleware;
authMiddleware.requireRole = requireRole;
authMiddleware.role = requireRole;
authMiddleware.sessionMiddleware = sessionMiddleware;
authMiddleware.generateToken = generateToken;
authMiddleware.verifyToken = verifyToken;
authMiddleware.parseCookies = parseCookies;

module.exports = authMiddleware;
