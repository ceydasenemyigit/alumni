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

// Relational Routes
// GET /api/users/:id/profile - Get alumni career profile (1:1)
router.get('/:id/profile', apiUserController.getUserProfile);

// GET /api/users/:id/department - Get user academic department (N:1)
router.get('/:id/department', apiUserController.getUserDepartment);

// GET /api/users/:id/jobs - Get job postings published by user (1:N)
router.get('/:id/jobs', apiUserController.getUserJobs);

// GET /api/users/:id/applications - Get job applications submitted by user (1:N / N:M Action)
router.get('/:id/applications', apiUserController.getUserApplications);

// GET /api/users/:id/relations - Get user fully populated with all relations
router.get('/:id/relations', apiUserController.getUserRelations);

module.exports = router;
