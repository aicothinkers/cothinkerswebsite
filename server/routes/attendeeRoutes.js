const express = require('express');
const router = express.Router();
const { syncAttendeesCSV, getEventAttendees } = require('../controllers/attendeeController');

router.post('/sync/:eventId', syncAttendeesCSV);
router.get('/event/:eventId', getEventAttendees);

module.exports = router;