const mongoose = require('mongoose');
const slugify = require('slugify');

const aiArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  sourceName: { type: String },
  sourceUrl: { type: String },
  coverImage: { type: String }
}, { timestamps: true });

aiArticleSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('AIArticle', aiArticleSchema);