const { Router } = require('express');
const multer = require('multer');
const apiUserController = require('../controllers/apiUserController');

const upload = multer();
const router = Router();

// GET /api/users - List users
router.get('/', apiUserController.getUsers);

// POST /api/users - Create user (supports json, urlencoded, multipart)
router.post('/', upload.none(), apiUserController.createUser);

// GET /api/users/:id - Get user by ID
router.get('/:id', apiUserController.getUserById);

// PUT /api/users/:id - Full update
router.put('/:id', upload.none(), apiUserController.updateUser);

// PATCH /api/users/:id - Partial update
router.patch('/:id', upload.none(), apiUserController.patchUser);

// DELETE /api/users/:id - Remove user
router.delete('/:id', apiUserController.deleteUser);

module.exports = router;
