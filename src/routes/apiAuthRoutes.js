const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

// POST /api/auth/register or /api/register
router.post('/register', authController.apiRegister);

// POST /api/auth/login or /api/login
router.post('/login', authController.apiLogin);

// POST /api/auth/logout or /api/logout
router.post('/logout', authController.apiLogout);

// GET /api/auth/me or /api/me
router.get('/me', authController.apiMe);

module.exports = router;
