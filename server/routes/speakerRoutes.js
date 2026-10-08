const express = require('express');
const { getSpeakers, createSpeaker, deleteSpeaker, getSpeakerBySlug, approveSpeaker,updateSpeaker } = require('../controllers/speakerController');


const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getSpeakers)
  .post(protect, createSpeaker);

  router.route('/:slug').get(getSpeakerBySlug);
// Add this specific route for deletion
router.route('/:id')
  .delete(protect, deleteSpeaker);
// Add this alongside your delete route
router.route('/:id/approve').patch(protect, approveSpeaker);
router.route('/:id')
  .put(protect, updateSpeaker) 
  .delete(protect, deleteSpeaker);
module.exports = router;