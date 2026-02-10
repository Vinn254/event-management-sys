const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    default: 'M-Pesa'
  },
  receiptNumber: String
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date']
  },
  time: {
    type: String,
    required: [true, 'Please provide event time']
  },
  location: {
    type: String,
    required: [true, 'Please provide event location']
  },
  price: {
    type: Number,
    required: [true, 'Please provide ticket price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    enum: ['concert', 'conference', 'workshop', 'sports', 'theater', 'festival', 'other'],
    default: 'other'
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide event capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  image: {
    type: String,
    default: '/uploads/default-event.jpg'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [attendeeSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for available tickets
eventSchema.virtual('availableTickets').get(function() {
  const totalBooked = this.attendees.reduce((sum, attendee) => sum + attendee.quantity, 0);
  return this.capacity - totalBooked;
});

// Ensure virtuals are included in JSON output
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
