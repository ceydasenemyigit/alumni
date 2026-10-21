const { Router } = require('express');
const multer = require('multer');
const apiApplicationController = require('../controllers/apiApplicationController');

const upload = multer();
const router = Router();

// GET /api/applications - List applications (supports ?user_id=, ?job_posting_id=, ?status=, ?with_relations=true)
router.get('/', apiApplicationController.getAll);

// POST /api/applications - Submit application
router.post('/', upload.none(), apiApplicationController.create);

// GET /api/applications/user/:userId - Direct applications by user ID
router.get('/user/:userId', apiApplicationController.getUserApplications);

// GET /api/applications/job/:jobId - Direct applications by job ID
router.get('/job/:jobId', apiApplicationController.getJobApplications);

// GET /api/applications/:id - Get single application
router.get('/:id', apiApplicationController.getById);

// GET /api/applications/:id/relations - Get single application with applicant and job posting
router.get('/:id/relations', apiApplicationController.getWithRelations);

// PUT /api/applications/:id - Full update
router.put('/:id', upload.none(), apiApplicationController.update);

// PATCH /api/applications/:id - Partial update
router.patch('/:id', upload.none(), apiApplicationController.patch);

// PATCH /api/applications/:id/status - Update status only
router.patch('/:id/status', upload.none(), apiApplicationController.updateStatus);

// DELETE /api/applications/:id - Remove/withdraw application
router.delete('/:id', apiApplicationController.remove);

module.exports = router;
