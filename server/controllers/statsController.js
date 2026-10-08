const Event = require('../models/Event');
const Speaker = require('../models/Speaker');
const Session = require('../models/Session');
const WriteUp = require('../models/WriteUp');
const AIArticle = require('../models/AIArticle');

const getDashboardStats = async (req, res) => {
  try {
    // Run all database count queries in parallel for high performance
    const [events, speakers, sessions, writeUps, aiArticles] = await Promise.all([
      Event.countDocuments(),
      Speaker.countDocuments(),
      Session.countDocuments(),
      WriteUp.countDocuments(),
      AIArticle.countDocuments()
    ]);

    res.json({
      success: true,
      data: { events, speakers, sessions, writeUps, aiArticles }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getDashboardStats };