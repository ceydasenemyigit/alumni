const loggerMiddleware = require('./loggerMiddleware');
const notFoundGuardian = require('./notFoundGuardian');
const { errorGuardian, writeErrorLog } = require('./errorGuardian');
const {
  sessionMiddleware,
  requireAuth,
  requireRole,
  generateToken,
  verifyToken
} = require('./authMiddleware');

module.exports = {
  loggerMiddleware,
  notFoundGuardian,
  errorGuardian,
  writeErrorLog,
  sessionMiddleware,
  requireAuth,
  requireRole,
  generateToken,
  verifyToken
};
