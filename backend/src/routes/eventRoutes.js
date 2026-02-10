const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents
} = require('../controllers/eventController');
const { protect, organizer } = require('../middleware/auth');

router.route('/')
  .get(getEvents)
  .post(protect, organizer, createEvent);

router.get('/my-events', protect, organizer, getMyEvents);
router.get('/:id', getEventById);
router.put('/:id', protect, organizer, updateEvent);
router.delete('/:id', protect, organizer, deleteEvent);

module.exports = router;
