const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: { type: String, required: true },
  designation: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendee', attendeeSchema);