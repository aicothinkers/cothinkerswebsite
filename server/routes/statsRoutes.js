const express = require('express');
const { getDashboardStats } = require('../controllers/statsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect ensures only logged-in admins can see the stats
router.route('/').get(protect, getDashboardStats);

module.exports = router;