const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { authMiddleware, requireRole } = require('../middlewares');

/**
 * User-Specific Portal & Workspace Web Routes
 * All routes require authenticated user session
 */
// Universal Dashboard Dispatcher
router.get('/dashboard', authMiddleware, portalController.getDashboard);

// 1. Student Portal (Role: STUDENT or ADMIN)
router.get('/student', authMiddleware, requireRole('STUDENT', 'ADMIN'), portalController.getStudentPortal);

// 2. Alumni Workspace (Role: ALUMNI or ADMIN)
router.get('/alumni', authMiddleware, requireRole('ALUMNI', 'ADMIN'), portalController.getAlumniPortal);
router.post('/alumni/applications/:id/status', authMiddleware, requireRole('ALUMNI', 'ADMIN'), portalController.postUpdateCandidateStatus);

// 3. User Specific Subpages
router.get('/my/applications', authMiddleware, portalController.getMyApplications);
router.get('/my/jobs', authMiddleware, requireRole('ALUMNI', 'ADMIN'), portalController.getMyJobs);
router.post('/portal/applications/:id/withdraw', authMiddleware, portalController.postWithdrawApplication);

// 4. Personal Account & Profile Settings
router.get('/profile', authMiddleware, portalController.getProfile);
router.get('/me', authMiddleware, portalController.getProfile);
router.post('/profile', authMiddleware, portalController.postUpdateProfile);

module.exports = router;
