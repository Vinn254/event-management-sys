const { Event } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, price, category, capacity, image } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      price,
      category,
      capacity,
      image: image || '/uploads/default-event.jpg',
      organizer: req.user._id
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Check if user is the organizer
      if (event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      const { title, description, date, time, location, price, category, capacity, image } = req.body;

      event.title = title || event.title;
      event.description = description || event.description;
      event.date = date || event.date;
      event.time = time || event.time;
      event.location = location || event.location;
      event.price = price !== undefined ? price : event.price;
      event.category = category || event.category;
      event.capacity = capacity || event.capacity;
      event.image = image || event.image;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      // Check if user is the organizer
      if (event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this event' });
      }

      await event.deleteOne();
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/my-events
// @access  Private (Organizer)
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents
};
