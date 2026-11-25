const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middlewares');

/**
 * Admin Web Routes (/admin)
 * Protected with RBAC Guard requireRole('ADMIN')
 */

// Role Claim / Elevation (Accessible to authenticate or elevate to Admin)
router.get('/claim', adminController.getClaim);
router.post('/claim', adminController.postClaim);

// Guard all subsequent admin routes with ADMIN role clearance
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Dashboard Overview
router.get('/', adminController.getDashboard);

// User Governance & Role Management
router.get('/users', adminController.getUsers);
router.post('/users/:id/role', adminController.postUserRole);
router.post('/users/:id/toggle-verify', adminController.postToggleUserVerify);
router.post('/users/:id/delete', adminController.postDeleteUser);

// Job Postings Moderation
router.get('/jobs', adminController.getJobs);
router.post('/jobs/:id/toggle-status', adminController.postToggleJobStatus);
router.post('/jobs/:id/delete', adminController.postDeleteJob);

// Candidate Application Pipeline
router.get('/applications', adminController.getApplications);
router.post('/applications/:id/status', adminController.postUpdateAppStatus);
router.post('/applications/:id/delete', adminController.postDeleteApp);

// Announcements & Broadcasts
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', adminController.postCreateAnnouncement);
router.post('/announcements/:id/delete', adminController.postDeleteAnnouncement);

module.exports = router;
