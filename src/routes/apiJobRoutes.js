const { Router } = require('express');
const multer = require('multer');
const apiJobController = require('../controllers/apiJobController');

const upload = multer();
const router = Router();

// GET /api/jobs - List job postings
router.get('/', apiJobController.getAll);

// POST /api/jobs - Create job posting
router.post('/', upload.none(), apiJobController.create);

// GET /api/jobs/:id - Get job by ID
router.get('/:id', apiJobController.getById);

// GET /api/jobs/:id/poster - Get the user who posted the job (Relational)
router.get('/:id/poster', apiJobController.getPoster);

// PUT /api/jobs/:id - Full update
router.put('/:id', upload.none(), apiJobController.update);

// PATCH /api/jobs/:id - Partial update
router.patch('/:id', upload.none(), apiJobController.patch);

// DELETE /api/jobs/:id - Remove job posting
router.delete('/:id', apiJobController.remove);

module.exports = router;
