const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://events-management-sysz.netlify.app',
  'https://event-management-sys-63du.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any netlify.app domain for flexibility
    if (origin && origin.includes('.netlify.app')) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

// Serve static files from frontend build in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Configure Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbhpx7quv',
  api_key: process.env.CLOUDINARY_API_KEY || '732653391372521',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'v8HV1nBLdQZiYAiHbwG3achXZ28'
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Import database connection
const { connectDB, generateToken, jwt, bcrypt, getMockStorage, User: UserModel, useMongoDB, useFirebase } = require('./config/db');
const { v4: uuidv4 } = require('uuid');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Event Management API is running',
    database: useMongoDB() ? 'MongoDB Atlas' : (useFirebase() ? 'Firebase' : 'Mock (no database)')
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('Connecting to database...');
  const { User, Event } = await connectDB();
  console.log('Database connected successfully');
  
  // Log which database we're using
  if (useMongoDB()) {
    console.log('📦 Using MongoDB Atlas database');
  } else if (useFirebase()) {
    console.log('📦 Using Firebase database');
  } else {
    console.log('📦 Using Mock database (data will reset on server restart)');
  }

  // Middleware to verify token
  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { _id: decoded.id };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, phone, password, role, otpMethod } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'user',
        otpMethod: otpMethod || 'email',
        tickets: []
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user && await bcrypt.compare(password, user.password)) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id)
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.get('/api/auth/profile', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/auth/tickets', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const userTickets = user?.tickets || [];
      
      // If user has no tickets, return sample tickets
      if (userTickets.length === 0) {
        const sampleTickets = [
          {
            id: 'sample-1',
            ticketNumber: 'SAMPLE-TKT-001',
            eventTitle: 'Tech Conference 2024',
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            eventTime: '09:00',
            eventLocation: 'Nairobi Convention Center',
            quantity: 2,
            totalAmount: 3000,
            receiptNumber: 'SAMPLE-RCPT-001',
            status: 'confirmed',
            isSample: true
          },
          {
            id: 'sample-2',
            ticketNumber: 'SAMPLE-TKT-002',
            eventTitle: 'Summer Music Festival',
            eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            eventTime: '16:00',
            eventLocation: 'Kasarani Stadium',
            quantity: 4,
            totalAmount: 8000,
            receiptNumber: 'SAMPLE-RCPT-002',
            status: 'confirmed',
            isSample: true
          }
        ];
        
        return res.json({
          tickets: sampleTickets,
          isSample: true,
          message: 'Sample tickets. Purchase real tickets to see your actual bookings.'
        });
      }
      
      res.json(userTickets);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Upload Route
  app.post('/api/upload', verifyToken, upload.single('image', async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'event-images', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      res.json({ url: result.secure_url, publicId: result.public_id });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
  }));

  // Events Routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await Event.find({ date: { $gte: new Date() } });
      const eventsWithAvailability = events.map(e => ({
        ...e.toObject ? e.toObject() : e,
        availableTickets: e.capacity - e.attendees.reduce((sum, a) => sum + a.quantity, 0)
      }));
      res.json(eventsWithAvailability);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/events/my-events', verifyToken, async (req, res) => {
    try {
      const events = await Event.find({ organizer: req.user._id });
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (event) {
        res.json({
          ...event.toObject ? event.toObject() : event,
          availableTickets: event.capacity - event.attendees.reduce((sum, a) => sum + a.quantity, 0)
        });
      } else {
        res.status(404).json({ message: 'Event not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/events', verifyToken, async (req, res) => {
    try {
      const event = await Event.create({
        ...req.body,
        organizer: req.user._id,
        attendees: [],
        image: req.body.image || ''
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.put('/api/events/:id', verifyToken, async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      if (event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/events/:id', verifyToken, async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      if (event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await Event.findByIdAndDelete(req.params.id);
      res.json({ message: 'Event removed' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Payment Routes
  app.post('/api/payments/process', verifyToken, async (req, res) => {
    try {
      const { eventId, quantity, phoneNumber } = req.body;
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      const availableTickets = event.capacity - event.attendees.reduce((sum, a) => sum + a.quantity, 0);
      if (availableTickets < quantity) {
        return res.status(400).json({ message: `Only ${availableTickets} tickets available` });
      }

      const totalAmount = event.price * quantity;
      const ticketNumber = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
      const receiptNumber = `RCPT-${uuidv4().slice(0, 8).toUpperCase()}`;

      const newAttendee = {
        userId: req.user._id,
        ticketNumber,
        quantity,
        totalAmount,
        paymentMethod: 'M-Pesa',
        receiptNumber,
        purchaseDate: new Date()
      };

      event.attendees.push(newAttendee);
      await event.save();

      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.tickets) user.tickets = [];
        user.tickets.push({ eventId, ticketNumber, quantity, totalAmount, paymentMethod: 'M-Pesa', receiptNumber, purchaseDate: new Date() });
        await user.save();
      }

      res.json({
        success: true,
        message: 'Payment successful',
        ticket: { ticketNumber, eventTitle: event.title, eventDate: event.date, eventTime: event.time, eventLocation: event.location, quantity, totalAmount, receiptNumber }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.get('/api/payments/history', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      res.json(user?.tickets || []);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Analytics Routes
  app.get('/api/analytics/dashboard', verifyToken, async (req, res) => {
    try {
      // Get user's events
      const userEvents = await Event.find({ organizer: req.user._id });

      // If user has no events, show demo/sample events
      if (userEvents.length === 0) {
        const demoEvents = await Event.find({ organizer: 'demo-organizer' });
        
        if (demoEvents.length > 0) {
          // Return demo events as sample data
          const totalEvents = demoEvents.length;
          let totalAttendees = 0;
          let totalRevenue = 0;
          const revenueByEvent = demoEvents.map(e => {
            const revenue = e.attendees.reduce((sum, a) => sum + a.totalAmount, 0);
            const attendees = e.attendees.reduce((sum, a) => sum + a.quantity, 0);
            totalAttendees += attendees;
            totalRevenue += revenue;
            return { eventTitle: e.title, revenue, attendees, price: e.price || 0, isDemo: true };
          });

          const recentTransactions = [];
          demoEvents.forEach(e => {
            e.attendees.forEach(a => {
              recentTransactions.push({
                ticketNumber: a.ticketNumber,
                eventTitle: e.title,
                quantity: a.quantity,
                amount: a.totalAmount,
                purchaseDate: a.purchaseDate,
                receiptNumber: a.receiptNumber
              });
            });
          });

          return res.json({
            totalEvents,
            totalAttendees,
            totalRevenue,
            revenueByEvent,
            ticketsSoldOverTime: [],
            recentTransactions: recentTransactions.slice(0, 10),
            isDemo: true,
            message: 'Sample analytics from demo events. Create your own events to see your analytics.'
          });
        }
      }

      // User has events - show their analytics
      const totalEvents = userEvents.length;
      let totalAttendees = 0;
      let totalRevenue = 0;
      const revenueByEvent = userEvents.map(e => {
        const revenue = e.attendees.reduce((sum, a) => sum + a.totalAmount, 0);
        const attendees = e.attendees.reduce((sum, a) => sum + a.quantity, 0);
        totalAttendees += attendees;
        totalRevenue += revenue;
        return { eventTitle: e.title, revenue, attendees, price: e.price || 0 };
      });

      const recentTransactions = [];
      userEvents.forEach(e => {
        e.attendees.forEach(a => {
          recentTransactions.push({
            ticketNumber: a.ticketNumber,
            eventTitle: e.title,
            quantity: a.quantity,
            amount: a.totalAmount,
            purchaseDate: a.purchaseDate,
            receiptNumber: a.receiptNumber
          });
        });
      });

      res.json({
        totalEvents,
        totalAttendees,
        totalRevenue,
        revenueByEvent,
        ticketsSoldOverTime: [],
        recentTransactions: recentTransactions.slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // SPA fallback - serve index.html for all non-API routes
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
