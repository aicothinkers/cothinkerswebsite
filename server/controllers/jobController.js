const Job = require('../models/Job');

// @desc    Get all jobs (Public sees only Open, Admin sees all)
// @route   GET /api/v1/jobs
const getJobs = async (req, res) => {
  try {
    const isAdmin = req.cookies && req.cookies.jwt;
    const filter = isAdmin ? {} : { status: 'Open' };
    
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/v1/jobs
const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Toggle Job Status
// @route   PATCH /api/v1/jobs/:id/status
const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    
    job.status = job.status === 'Open' ? 'Closed' : 'Open';
    await job.save();
    
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/v1/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// Add this new function above your module.exports
// @desc    Update a job
// @route   PUT /api/v1/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } // new: true returns the updated document
    );
    
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update your exports to include it:
module.exports = { getJobs, createJob, updateJob, toggleJobStatus, deleteJob };

