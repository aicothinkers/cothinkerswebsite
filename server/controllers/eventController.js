const Event = require('../models/Event');

// ==========================================
// UTILITY: GITHUB CDN UPLOADER
// ==========================================
const uploadToGitHub = async (base64Image, filename) => {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const repo = process.env.GITHUB_REPO; 
  const token = process.env.GITHUB_TOKEN;
  const path = `events/${Date.now()}-${filename}`;

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload event banner: ${filename}`,
      content: base64Data
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'GitHub Upload Failed');
  
  return data.content.download_url; 
};

// ==========================================
// CONTROLLERS
// ==========================================

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('speakers').sort({ date: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/v1/events
// @access  Private (Admin)
const createEvent = async (req, res) => {
  try {
    let eventData = { ...req.body };

    // Catch the compressed image from the frontend and push it to GitHub
    if (req.body.imageBase64) {
      const filename = (req.body.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      eventData.bannerUrl = await uploadToGitHub(req.body.imageBase64, filename);
    }

    const event = await Event.create(eventData);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/v1/events/:id
// @access  Private (Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single event by slug with populated speakers
// @route   GET /api/v1/events/:slug
// @access  Public
const getEventBySlug = async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug }).populate('speakers');
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add this new function above module.exports
// @desc    Update an event
// @route   PUT /api/v1/events/:id
// @access  Private (Admin)
const updateEvent = async (req, res) => {
  try {
    let eventData = { ...req.body };

    // If a new image was uploaded during the edit, push it to GitHub
    if (req.body.imageBase64) {
      const filename = (req.body.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      eventData.bannerUrl = await uploadToGitHub(req.body.imageBase64, filename);
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update your exports at the bottom to include it:
module.exports = { getEvents, createEvent, updateEvent, deleteEvent, getEventBySlug };

