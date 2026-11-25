const loggerMiddleware = require('./loggerMiddleware');
const notFoundGuardian = require('./notFoundGuardian');
const { errorGuardian, writeErrorLog } = require('./errorGuardian');
const authMiddleware = require('./authMiddleware');
const {
  sessionMiddleware,
  requireAuth,
  requireRole,
  generateToken,
  verifyToken
} = authMiddleware;

module.exports = {
  loggerMiddleware,
  notFoundGuardian,
  errorGuardian,
  writeErrorLog,
  authMiddleware,
  sessionMiddleware,
  requireAuth,
  requireRole,
  generateToken,
  verifyToken
};
