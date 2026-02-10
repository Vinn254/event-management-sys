const { Event, User } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Process payment and book tickets
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { eventId, quantity, phoneNumber } = req.body;
    const userId = req.user._id;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check availability
    const totalBooked = event.attendees.reduce((sum, attendee) => sum + attendee.quantity, 0);
    const availableTickets = event.capacity - totalBooked;

    if (availableTickets < quantity) {
      return res.status(400).json({ message: `Only ${availableTickets} tickets available` });
    }

    const totalAmount = event.price * quantity;
    const ticketNumber = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const receiptNumber = `RCPT-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Simulate payment
    const paymentResult = await simulateMpesaPayment(phoneNumber, totalAmount);

    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Payment failed. Please try again.' });
    }

    // Add attendee to event
    const newAttendee = {
      userId,
      ticketNumber,
      quantity,
      totalAmount,
      paymentMethod: 'M-Pesa',
      receiptNumber: paymentResult.receiptNumber || receiptNumber
    };

    event.attendees.push(newAttendee);
    await event.save();

    // Add ticket to user's tickets
    const user = await User.findById(userId);
    if (!user.tickets) user.tickets = [];
    user.tickets.push({
      eventId,
      ticketNumber,
      quantity,
      totalAmount,
      paymentMethod: 'M-Pesa',
      receiptNumber: paymentResult.receiptNumber || receiptNumber
    });
    await user.save();

    res.json({
      success: true,
      message: 'Payment successful',
      ticket: {
        ticketNumber,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        quantity,
        totalAmount,
        receiptNumber: paymentResult.receiptNumber || receiptNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Simulate M-Pesa payment
const simulateMpesaPayment = async (phoneNumber, amount) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const isSuccess = Math.random() > 0.05;

  return {
    success: isSuccess,
    receiptNumber: isSuccess ? `MPESA-${Date.now()}` : null,
    message: isSuccess ? 'Payment processed successfully' : 'Payment failed'
  };
};

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.tickets || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate PDF ticket
// @route   GET /api/payments/ticket/:ticketNumber
// @access  Private
const generateTicketPDF = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    // Find user with this ticket
    let foundUser = null;
    let foundTicket = null;

    for (const user of require('../config/db').mockStorage?.users?.values?.() || []) {
      const ticket = (user.tickets || []).find(t => t.ticketNumber === ticketNumber);
      if (ticket) {
        foundUser = user;
        foundTicket = ticket;
        break;
      }
    }

    if (!foundUser) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const event = await Event.findById(foundTicket.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Generate simple text ticket
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${ticketNumber}.txt`);

    res.write('='.repeat(50));
    res.write('\nEVENT TICKET\n');
    res.write('='.repeat(50));
    res.write(`\nTicket Number: ${ticketNumber}`);
    res.write(`\nEvent: ${event.title}`);
    res.write(`\nDate: ${new Date(event.date).toLocaleDateString()}`);
    res.write(`\nTime: ${event.time}`);
    res.write(`\nLocation: ${event.location}`);
    res.write(`\nQuantity: ${foundTicket.quantity}`);
    res.write(`\nTotal Amount: KES ${foundTicket.totalAmount}`);
    res.write(`\nPhone: ${foundUser.phone}`);
    res.write(`\nReceipt: ${foundTicket.receiptNumber}`);
    res.write('\n' + '='.repeat(50));
    res.write('\nThank you for booking with EventHub!\n');
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  processPayment,
  getPaymentHistory,
  generateTicketPDF
};
