const { Router } = require('express');
const applicationController = require('../controllers/applicationController');

const router = Router();

// 1. GET /applications - Listing view
router.get('/', applicationController.index);

// 2. GET /applications/new - Form to submit application
router.get('/new', applicationController.newForm);

// 3. POST /applications - Create from form
router.post('/', applicationController.create);

// 4. GET /applications/:id - Show details
router.get('/:id', applicationController.show);

// 5. GET /applications/:id/edit - Edit form
router.get('/:id/edit', applicationController.editForm);

// 6. PUT or POST /applications/:id - Updating
router.put('/:id', applicationController.update);
router.post('/:id', applicationController.update); // HTML form POST fallback

// 7. DELETE or POST /applications/:id/delete - Deleting
router.delete('/:id', applicationController.delete);
router.post('/:id/delete', applicationController.delete); // HTML form button fallback

module.exports = router;
