const express = require('express');
const {
  getSessions, createSession, deleteSession,
  getWriteUps, createWriteUp, deleteWriteUp,
  getAIArticles, createAIArticle, deleteAIArticle,
  getWriteUpBySlug, getAIArticleBySlug,updateSession,updateWriteUp,updateAIArticle,
} = require('../controllers/contentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Session Routes
router.route('/sessions').get(getSessions).post(protect, createSession);
router.route('/sessions/:id').delete(protect, deleteSession);

// Write-up Routes
router.route('/write-ups').get(getWriteUps).post(protect, createWriteUp);
router.route('/write-ups/:id').delete(protect, deleteWriteUp);

// AI Article Routes
router.route('/ai-blog').get(getAIArticles).post(protect, createAIArticle);
router.route('/ai-blog/:id').delete(protect, deleteAIArticle);

router.route('/write-ups/:slug').get(getWriteUpBySlug);
router.route('/ai-blog/:slug').get(getAIArticleBySlug);

// Import the 3 new update controllers at the top
router.route('/sessions/:id').put(protect, updateSession).delete(protect, deleteSession);
router.route('/write-ups/:id').put(protect, updateWriteUp).delete(protect, deleteWriteUp);
router.route('/ai-blog/:id').put(protect, updateAIArticle).delete(protect, deleteAIArticle);

module.exports = router;