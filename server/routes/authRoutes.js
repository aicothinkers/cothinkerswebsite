const express = require('express');
const { loginAdmin, logoutAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', protect, getMe);

module.exports = router;