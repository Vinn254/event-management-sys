const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get organizer dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Organizer)
const getDashboardAnalytics = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Get all events created by this organizer
    const events = await Event.find({ organizer: organizerId });

    // Calculate metrics
    const totalEvents = events.length;
    
    let totalAttendees = 0;
    let totalRevenue = 0;
    const revenueByEvent = [];
    const revenueByCategory = {};
    const eventsByCategory = {};
    const eventsByPriceRange = {
      'Free': 0,
      'KES 1-500': 0,
      'KES 501-2000': 0,
      'KES 2001-5000': 0,
      'KES 5000+': 0
    };
    const ticketsSoldOverTime = [];
    const categoryColors = {
      concert: '#8b5cf6',
      conference: '#3b82f6',
      workshop: '#10b981',
      sports: '#f59e0b',
      theater: '#ec4899',
      festival: '#f97316',
      other: '#6366f1'
    };

    events.forEach(event => {
      const attendees = event.attendees.reduce((sum, a) => sum + a.quantity, 0);
      const revenue = event.attendees.reduce((sum, a) => sum + a.totalAmount, 0);
      
      totalAttendees += attendees;
      totalRevenue += revenue;

      // Revenue by Event
      revenueByEvent.push({
        eventTitle: event.title,
        revenue,
        attendees,
        price: event.price
      });

      // Revenue by Category
      if (revenueByCategory[event.category]) {
        revenueByCategory[event.category] += revenue;
        eventsByCategory[event.category] += 1;
      } else {
        revenueByCategory[event.category] = revenue;
        eventsByCategory[event.category] = 1;
      }

      // Events by Price Range
      if (event.price === 0) {
        eventsByPriceRange['Free'] += 1;
      } else if (event.price <= 500) {
        eventsByPriceRange['KES 1-500'] += 1;
      } else if (event.price <= 2000) {
        eventsByPriceRange['KES 501-2000'] += 1;
      } else if (event.price <= 5000) {
        eventsByPriceRange['KES 2001-5000'] += 1;
      } else {
        eventsByPriceRange['KES 5000+'] += 1;
      }

      // Group tickets by month
      event.attendees.forEach(attendee => {
        const purchaseDate = new Date(attendee.purchaseDate);
        const monthKey = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;
        
        const existingMonth = ticketsSoldOverTime.find(m => m.month === monthKey);
        if (existingMonth) {
          existingMonth.tickets += attendee.quantity;
          existingMonth.revenue += attendee.totalAmount;
        } else {
          ticketsSoldOverTime.push({
            month: monthKey,
            tickets: attendee.quantity,
            revenue: attendee.totalAmount
          });
        }
      });
    });

    // Sort by month
    ticketsSoldOverTime.sort((a, b) => a.month.localeCompare(b.month));

    // Format category data for pie chart
    const categoryData = Object.keys(revenueByCategory).map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: revenueByCategory[category],
      count: eventsByCategory[category],
      color: categoryColors[category] || categoryColors.other
    }));

    // Format price range data for pie chart
    const priceRangeData = Object.keys(eventsByPriceRange).map(range => ({
      name: range,
      value: eventsByPriceRange[range]
    })).filter(item => item.value > 0);

    // Get recent transactions
    const recentTransactions = [];
    events.forEach(event => {
      event.attendees.forEach(attendee => {
        recentTransactions.push({
          ticketNumber: attendee.ticketNumber,
          eventTitle: event.title,
          quantity: attendee.quantity,
          amount: attendee.totalAmount,
          purchaseDate: attendee.purchaseDate,
          receiptNumber: attendee.receiptNumber
        });
      });
    });

    // Sort by date and take last 10
    recentTransactions.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    res.json({
      totalEvents,
      totalAttendees,
      totalRevenue,
      revenueByEvent,
      revenueByEventForPie: revenueByEvent.map(e => ({
        name: e.eventTitle,
        value: e.revenue
      })),
      categoryData,
      priceRangeData,
      ticketsSoldOverTime,
      recentTransactions: recentTransactions.slice(0, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get event-specific analytics
// @route   GET /api/analytics/event/:eventId
// @access  Private (Organizer)
const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    const event = await Event.findOne({ _id: eventId, organizer: organizerId });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const totalTicketsSold = event.attendees.reduce((sum, a) => sum + a.quantity, 0);
    const totalRevenue = event.attendees.reduce((sum, a) => sum + a.totalAmount, 0);
    const availableTickets = event.capacity - totalTicketsSold;
    const occupancyRate = (totalTicketsSold / event.capacity) * 100;

    res.json({
      eventTitle: event.title,
      totalTicketsSold,
      totalRevenue,
      availableTickets,
      occupancyRate: occupancyRate.toFixed(2),
      attendees: event.attendees
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
  getEventAnalytics
};
