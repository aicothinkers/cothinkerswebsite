const CommunitySubscriber = require('../models/CommunitySubscriber');

const subscribeCommunity = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const existing = await CommunitySubscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'This email is already registered to the community!' });
    }

    await CommunitySubscriber.create({ email });
    res.status(201).json({ success: true, data: { message: 'Successfully joined the community!' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { subscribeCommunity };