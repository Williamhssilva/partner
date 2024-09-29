const express = require('express');
const { getDashboardData } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('administrador'));

router.get('/dashboard', getDashboardData);

module.exports = router;
