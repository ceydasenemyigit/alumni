const { Router } = require('express');
const healthController = require('../controllers/healthController');

const router = Router();

// GET /api/health
router.get('/', healthController.getHealth);

module.exports = router;
