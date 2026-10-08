const Speaker = require('../models/Speaker');
const Session = require('../models/Session');

// ==========================================
// UTILITY: GITHUB CDN UPLOADER
// ==========================================
const uploadToGitHub = async (base64Image, filename) => {
  // Strip the 'data:image/jpeg;base64,' or 'data:image/png;base64,' prefix
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const repo = process.env.GITHUB_REPO; // e.g., "yourusername/aicothinkers-media"
  const token = process.env.GITHUB_TOKEN;
  
  // Add a timestamp to prevent filename collisions
  const path = `speakers/${Date.now()}-${filename}`;

  // Use Node 18+ native fetch to talk directly to GitHub API
  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload speaker profile: ${filename}`,
      content: base64Data
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'GitHub Upload Failed');
  }
  
  // Return the raw CDN download link
  return data.content.download_url; 
};

// ==========================================
// CONTROLLERS
// ==========================================

// @desc    Get all speakers
// @route   GET /api/v1/speakers
// @access  Public (Frontend handles filtering Approved vs Pending)
const getSpeakers = async (req, res) => {
  try {
    const speakers = await Speaker.find().sort({ createdAt: -1 });
    res.json({ success: true, data: speakers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a speaker (Admin Manual or Public Form)
// @route   POST /api/v1/speakers
// @access  Public (Admin passes status='Approved', Public defaults to 'Pending')
const createSpeaker = async (req, res) => {
  try {
    let { name, designation, company, bio, linkedinUrl, photoUrl, imageBase64, status } = req.body;

    // If a file was uploaded from the frontend, process the Base64 string and push to GitHub
    if (imageBase64) {
      const filename = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      photoUrl = await uploadToGitHub(imageBase64, filename);
    }

    const speaker = await Speaker.create({
      name, 
      designation, 
      company, 
      bio, 
      linkedinUrl, 
      photoUrl, 
      status: status || 'Pending' // Defaults to pending if status is missing
    });

    res.status(201).json({ success: true, data: speaker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Approve a speaker
// @route   PATCH /api/v1/speakers/:id/approve
// @access  Private (Admin)
const approveSpeaker = async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndUpdate(
      req.params.id, 
      { status: 'Approved' }, 
      { new: true }
    );
    
    if (!speaker) {
      return res.status(404).json({ success: false, error: 'Speaker not found' });
    }
    
    res.status(200).json({ success: true, data: speaker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a speaker
// @route   DELETE /api/v1/speakers/:id
// @access  Private (Admin)
const deleteSpeaker = async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndDelete(req.params.id);
    if (!speaker) {
      return res.status(404).json({ success: false, error: 'Speaker not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single speaker by slug with sessions
// @route   GET /api/v1/speakers/:slug
// @access  Public
const getSpeakerBySlug = async (req, res) => {
  try {
    const speaker = await Speaker.findOne({ slug: req.params.slug });
    if (!speaker) {
      return res.status(404).json({ success: false, error: 'Speaker not found' });
    }
    
    // Find all sessions delivered by this speaker
    const sessions = await Session.find({ speaker: speaker._id }).populate('event');
    
    res.json({ success: true, data: { speaker, sessions } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a speaker
// @route   PUT /api/v1/speakers/:id
const updateSpeaker = async (req, res) => {
  try {
    let speakerData = { ...req.body };
    if (req.body.imageBase64) {
      const filename = (req.body.name || 'speaker').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      speakerData.photoUrl = await uploadToGitHub(req.body.imageBase64, filename);
    }
    const speaker = await Speaker.findByIdAndUpdate(req.params.id, speakerData, { new: true, runValidators: true });
    if (!speaker) return res.status(404).json({ success: false, error: 'Speaker not found' });
    res.json({ success: true, data: speaker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
// ADD 'updateSpeaker' to your module.exports!

module.exports = { 
  getSpeakers, 
  createSpeaker, 
  approveSpeaker, 
  deleteSpeaker, 
  getSpeakerBySlug,
  updateSpeaker
};