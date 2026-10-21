const { Router } = require('express');
const multer = require('multer');
const apiDepartmentController = require('../controllers/apiDepartmentController');

const upload = multer();
const router = Router();

// GET /api/departments - List all departments
router.get('/', apiDepartmentController.getAll);

// POST /api/departments - Create department
router.post('/', upload.none(), apiDepartmentController.create);

// GET /api/departments/:id - Get department by ID
router.get('/:id', apiDepartmentController.getById);

// GET /api/departments/:id/users - Get users in department (Relational)
router.get('/:id/users', apiDepartmentController.getUsers);

module.exports = router;
