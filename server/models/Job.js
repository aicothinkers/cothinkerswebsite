const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true }, // e.g., "Remote", "Bangalore, India"
  type: { type: String, required: true }, // e.g., "Full-time", "Internship", "Contract"
  description: { type: String, required: true },
  applyUrl: { type: String, required: true },

  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);