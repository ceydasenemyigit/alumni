const { Router } = require('express');
const multer = require('multer');
const apiAnnouncementController = require('../controllers/apiAnnouncementController');

const upload = multer();
const router = Router();

// GET /api/announcements - List announcements
router.get('/', apiAnnouncementController.getAll);

// POST /api/announcements - Create announcement (supports JSON, urlencoded, multipart)
router.post('/', upload.none(), apiAnnouncementController.create);

// GET /api/announcements/:id - Get announcement by ID
router.get('/:id', apiAnnouncementController.getById);

// PUT /api/announcements/:id - Full update
router.put('/:id', upload.none(), apiAnnouncementController.update);

// PATCH /api/announcements/:id - Partial update
router.patch('/:id', upload.none(), apiAnnouncementController.patch);

// DELETE /api/announcements/:id - Remove announcement
router.delete('/:id', apiAnnouncementController.remove);

module.exports = router;
