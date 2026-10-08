const mongoose = require('mongoose');
const slugify = require('slugify');

const writeUpSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String }
}, { timestamps: true });

writeUpSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('WriteUp', writeUpSchema);