const { Router } = require('express');
const announcementController = require('../controllers/announcementController');

const router = Router();

// 1. GET /announcements - Listing view
router.get('/', announcementController.index);

// 2. GET /announcements/new - Form to create
router.get('/new', announcementController.newForm);

// 3. POST /announcements - Creating from form
router.post('/', announcementController.create);

// 4. GET /announcements/:id - Show details
router.get('/:id', announcementController.show);

// 5. GET /announcements/:id/edit - Edit form
router.get('/:id/edit', announcementController.editForm);

// 6. PUT or POST /announcements/:id - Updating
router.put('/:id', announcementController.update);
router.post('/:id', announcementController.update); // HTML form POST fallback

// 7. DELETE or POST /announcements/:id/delete - Deleting
router.delete('/:id', announcementController.delete);
router.post('/:id/delete', announcementController.delete); // HTML form button fallback

module.exports = router;
