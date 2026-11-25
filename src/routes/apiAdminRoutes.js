const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middlewares');

/**
 * RESTful Admin API Routes (/api/admin)
 * Protected with RBAC requireRole('ADMIN')
 */

// Role Claim / Antigravity Admin Token Acquisition
router.post('/claim', adminController.apiClaim);

// Protected RBAC Admin Subsystem
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Administrative Telemetry
router.get('/stats', adminController.apiGetStats);

// User Governance
router.get('/users', adminController.apiGetUsers);
router.patch('/users/:id/role', adminController.apiUpdateUserRole);
router.patch('/users/:id/verify', adminController.apiToggleUserVerify);
router.delete('/users/:id', adminController.apiDeleteUser);

// Job Postings Control
router.get('/jobs', adminController.apiGetJobs);
router.patch('/jobs/:id/status', adminController.apiToggleJobStatus);
router.delete('/jobs/:id', adminController.apiDeleteJob);

// Application Pipeline Control
router.get('/applications', adminController.apiGetApplications);
router.patch('/applications/:id/status', adminController.apiUpdateAppStatus);
router.delete('/applications/:id', adminController.apiDeleteApp);

module.exports = router;
