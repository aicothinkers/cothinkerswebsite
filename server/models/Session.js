const mongoose = require('mongoose');
const slugify = require('slugify');

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  topic: { type: String, required: true },
  summary: { type: String, required: true },
  keyTakeaways: { type: String },
  youtubeUrl: { type: String },
  coverImage: { type: String }
}, { timestamps: true });

sessionSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Session', sessionSchema);