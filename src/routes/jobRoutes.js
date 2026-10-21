const { Router } = require('express');
const jobController = require('../controllers/jobController');

const router = Router();

// 1. GET /jobs - Listing view
router.get('/', jobController.index);

// 2. GET /jobs/new - Form to create
router.get('/new', jobController.newForm);

// 3. POST /jobs - Creating from form
router.post('/', jobController.create);

// 4. GET /jobs/:id - Show details
router.get('/:id', jobController.show);

// 5. GET /jobs/:id/edit - Edit form
router.get('/:id/edit', jobController.editForm);

// 6. PUT or POST /jobs/:id - Updating
router.put('/:id', jobController.update);
router.post('/:id', jobController.update); // HTML form POST fallback

// 7. DELETE or POST /jobs/:id/delete - Deleting
router.delete('/:id', jobController.delete);
router.post('/:id/delete', jobController.delete); // HTML form button fallback

module.exports = router;
