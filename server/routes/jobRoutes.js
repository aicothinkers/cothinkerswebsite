const express = require('express');
const { getJobs, createJob, updateJob, toggleJobStatus, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, createJob);

router.route('/:id/status').patch(protect, toggleJobStatus);

router.route('/:id')
  .put(protect, updateJob) // NEW: Added PUT route for editing
  .delete(protect, deleteJob);

module.exports = router;