const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  edition: { type: Number, required: true },
  date: { type: Date, required: true },
  city: { type: String, required: true, default: 'Hyderabad' }, // NEW: Multi-city tracking
  venue: { type: String, required: true },
  description: { type: String, required: true },
  bannerUrl: { type: String },
  status: { type: String, enum: ['Draft', 'Published', 'Completed'], default: 'Draft' },
  speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' }],
  registerUrl: { type: String },
}, { timestamps: true });

// Auto-generate slug from title (Modern Mongoose format)
eventSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Event', eventSchema);