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
 * Session Middleware
 * Hydrates req.user and res.locals.currentUser from cookies or Authorization Bearer header
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
      // Fetch fresh user or use token payload
      const user = await userModel.findById(payload.id);
      if (user) {
        req.user = user;
        res.locals.currentUser = user;
        return next();
      }
    }
  }

  req.user = null;
  res.locals.currentUser = null;
  next();
}

/**
 * Route Guard: Require authenticated user
 */
function requireAuth(req, res, next) {
  if (req.user) {
    return next();
  }

  const isApi = req.path.startsWith('/api') || !req.accepts('html');
  if (isApi) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'You must be signed in to perform this operation.'
    });
  }

  res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl || '/')}`);
}

/**
 * Route Guard: Require specific roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      const isApi = req.path.startsWith('/api') || !req.accepts('html');
      if (isApi) {
        return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Sign in required.' });
      }
      return res.redirect('/login');
    }

    if (!roles.includes(req.user.role)) {
      const isApi = req.path.startsWith('/api') || !req.accepts('html');
      if (isApi) {
        return res.status(403).json({ success: false, error: 'Forbidden', message: `Requires one of roles: ${roles.join(', ')}` });
      }
      return res.status(403).render('error', {
        title: 'Access Restricted',
        message: 'Your account clearance does not permit access to this section.'
      });
    }

    next();
  };
}

module.exports = {
  generateToken,
  verifyToken,
  sessionMiddleware,
  requireAuth,
  requireRole
};
