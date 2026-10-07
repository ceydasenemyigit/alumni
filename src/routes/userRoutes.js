const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

// 1. GET /users - Listing
router.get('/', userController.index);

// 2. GET /users/new - Form to create
router.get('/new', userController.newForm);

// 3. POST /users - Creating
router.post('/', userController.create);

// 4. GET /users/:id - Show details
router.get('/:id', userController.show);

// 5. GET /users/:id/edit - Edit form
router.get('/:id/edit', userController.editForm);

// 6. PUT or POST /users/:id - Updating
router.put('/:id', userController.update);
router.post('/:id', userController.update); // HTML form POST fallback

// 7. DELETE or POST /users/:id/delete - Deleting
router.delete('/:id', userController.delete);
router.post('/:id/delete', userController.delete); // HTML form button fallback

module.exports = router;
