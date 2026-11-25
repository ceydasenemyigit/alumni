const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

// GET /register - Display registration page
router.get('/register', authController.getRegister);

// POST /register - Handle registration form submission
router.post('/register', authController.postRegister);

// GET /login - Display sign in page
router.get('/login', authController.getLogin);

// POST /login - Handle sign in form submission
router.post('/login', authController.postLogin);

// GET /logout & POST /logout - Handle user sign out
router.get('/logout', authController.getLogout);
router.post('/logout', authController.postLogout);

module.exports = router;
