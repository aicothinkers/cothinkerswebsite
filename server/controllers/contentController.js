const Session = require('../models/Session');
const WriteUp = require('../models/WriteUp');
const AIArticle = require('../models/AIArticle');

// ==========================================
// UTILITY: GITHUB CDN UPLOADER
// ==========================================
const uploadToGitHub = async (base64Image, filename, folder) => {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const repo = process.env.GITHUB_REPO; 
  const token = process.env.GITHUB_TOKEN;
  const path = `${folder}/${Date.now()}-${filename}`;

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload ${folder} image: ${filename}`,
      content: base64Data
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'GitHub Upload Failed');
  
  return data.content.download_url; 
};

// --- SESSIONS ---
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate('speaker').populate('event').sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

const createSession = async (req, res) => {
  try {
    let sessionData = { ...req.body };
    if (req.body.imageBase64) {
      const filename = (req.body.title || 'session').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      sessionData.coverImage = await uploadToGitHub(req.body.imageBase64, filename, 'sessions');
    }
    const session = await Session.create(sessionData);
    res.status(201).json({ success: true, data: session });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
};

const deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

// --- WRITE-UPS ---
const getWriteUps = async (req, res) => {
  try {
    const writeUps = await WriteUp.find().populate('speaker').populate('event').sort({ createdAt: -1 });
    res.json({ success: true, data: writeUps });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

const createWriteUp = async (req, res) => {
  try {
    let writeUpData = { ...req.body };
    if (req.body.imageBase64) {
      const filename = (req.body.title || 'writeup').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      writeUpData.coverImage = await uploadToGitHub(req.body.imageBase64, filename, 'write-ups');
    }
    const writeUp = await WriteUp.create(writeUpData);
    res.status(201).json({ success: true, data: writeUp });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
};

const deleteWriteUp = async (req, res) => {
  try {
    await WriteUp.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

const getWriteUpBySlug = async (req, res) => {
  try {
    const writeUp = await WriteUp.findOne({ slug: req.params.slug })
      .populate('speaker')
      .populate('event');
    if (!writeUp) return res.status(404).json({ success: false, error: 'Write-up not found' });
    res.json({ success: true, data: writeUp });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

// --- AI ARTICLES ---
const getAIArticles = async (req, res) => {
  try {
    const articles = await AIArticle.find().sort({ createdAt: -1 });
    res.json({ success: true, data: articles });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

const createAIArticle = async (req, res) => {
  try {
    let articleData = { ...req.body };
    if (req.body.imageBase64) {
      const filename = (req.body.title || 'article').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      articleData.coverImage = await uploadToGitHub(req.body.imageBase64, filename, 'ai-blog');
    }
    const article = await AIArticle.create(articleData);
    res.status(201).json({ success: true, data: article });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
};

const deleteAIArticle = async (req, res) => {
  try {
    await AIArticle.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};

const getAIArticleBySlug = async (req, res) => {
  try {
    const article = await AIArticle.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ success: false, error: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
};
const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: session });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
};

const updateWriteUp = async (req, res) => {
  try {
    let writeUpData = { ...req.body };
    if (req.body.imageBase64) {
      const filename = (req.body.title || 'writeup').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      writeUpData.coverImage = await uploadToGitHub(req.body.imageBase64, filename, 'write-ups');
    }
    const writeUp = await WriteUp.findByIdAndUpdate(req.params.id, writeUpData, { new: true });
    res.json({ success: true, data: writeUp });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
};

const updateAIArticle = async (req, res) => {
  try {
    let articleData = { ...req.body };
    if (req.body.imageBase64) {
      const filename = (req.body.title || 'article').toLowerCase().replace(/[^a-z0-9]/g, '') + '.jpg';
      articleData.coverImage = await uploadToGitHub(req.body.imageBase64, filename, 'ai-blog');
    }
    const article = await AIArticle.findByIdAndUpdate(req.params.id, articleData, { new: true });
    res.json({ success: true, data: article });
  } catch (error) { res.status(400).json({ success: false, error: error.message }); }
};
// ADD ALL 3 TO YOUR module.exports!

module.exports = {
  getSessions, createSession, deleteSession,
  getWriteUps, createWriteUp, deleteWriteUp, getWriteUpBySlug,
  getAIArticles, createAIArticle, deleteAIArticle, getAIArticleBySlug,updateSession,updateWriteUp,updateAIArticle,
};