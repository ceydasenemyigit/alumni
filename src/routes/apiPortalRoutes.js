const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { authMiddleware } = require('../middlewares');

/**
 * RESTful API Routes for Authenticated User Profile & Telemetry (/api/me)
 */
router.use(authMiddleware);

router.get('/', portalController.apiGetMe);
router.get('/applications', portalController.apiGetMyApplications);
router.get('/jobs', portalController.apiGetMyJobs);
router.put('/profile', portalController.apiUpdateProfile);
router.patch('/profile', portalController.apiUpdateProfile);

module.exports = router;
