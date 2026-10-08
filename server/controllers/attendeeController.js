const Attendee = require('../models/Attendee');
const Event = require('../models/Event');

// @desc    Bulk Sync Attendees from CSV
// @route   POST /api/v1/attendees/sync/:eventId
// @access  Private (Admin)
const syncAttendeesCSV = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendees } = req.body; 

    if (!attendees || !Array.isArray(attendees)) {
      return res.status(400).json({ success: false, error: 'Invalid data format' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    // Use bulkWrite to insert new attendees and update existing ones (based on email)
// Use bulkWrite to insert new attendees and update existing ones (based on NAME now)
    const bulkOps = attendees.map(attendee => ({
      updateOne: {
        filter: { event: eventId, name: attendee.name }, // Checks if this Name already exists
        update: { $set: { ...attendee, event: eventId } },
        upsert: true // Creates it if it doesn't exist
      }
    }));

    if (bulkOps.length > 0) {
      await Attendee.bulkWrite(bulkOps);
    }

    res.status(200).json({ success: true, message: `Successfully synced ${attendees.length} attendees.` });
  } catch (error) {
    console.error('CSV Sync Error:', error);
    res.status(500).json({ success: false, error: 'Failed to sync attendees.' });
  }
};

// @desc    Get all attendees for a specific event
// @route   GET /api/v1/attendees/event/:eventId
// @access  Public
const getEventAttendees = async (req, res) => {
   try {
     const attendees = await Attendee.find({ event: req.params.eventId }).sort({ registeredAt: -1 });
     res.status(200).json({ success: true, count: attendees.length, data: attendees });
   } catch(error) {
     res.status(500).json({ success: false, error: error.message });
   }
};

module.exports = { syncAttendeesCSV, getEventAttendees };