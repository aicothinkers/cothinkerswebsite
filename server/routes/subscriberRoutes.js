const express = require('express');
const { subscribeCommunity } = require('../controllers/subscriberController');
const router = express.Router();

router.route('/subscribe').post(subscribeCommunity);

module.exports = router;