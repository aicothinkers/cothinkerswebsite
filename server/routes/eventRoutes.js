const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent, getEventBySlug } = require('../controllers/eventController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.route('/:slug').get(getEventBySlug);

// Added PUT route for editing
router.route('/:id')
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

module.exports = router;