const mongoose = require('mongoose');
const slugify = require('slugify');

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  designation: { type: String, required: true },
  company: { type: String, required: true },
  bio: { type: String },
  photoUrl: { type: String }, 
  linkedinUrl: { type: String },
  // SECURITY UPGRADE: Approval Status
  status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' } 
}, { timestamps: true });

speakerSchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Speaker', speakerSchema);