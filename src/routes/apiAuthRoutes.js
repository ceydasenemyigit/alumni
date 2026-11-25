const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

// POST /api/auth/register or /api/register
router.post('/register', authController.apiRegister);

module.exports = router;
