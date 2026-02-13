const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getFirestore } = require('./firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'event-management-secret-key-2024';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// In-memory storage as fallback
const mockStorage = {
  users: new Map(),
  events: new Map()
};

let userIdCounter = 1;
let eventIdCounter = 1;

// Mock User class for fallback
class MockUser {
  constructor(data) {
    this._id = data._id || String(userIdCounter++);
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
    this.role = data.role || 'user';
    this.otpMethod = data.otpMethod || 'email';
    this.tickets = data.tickets || [];
    this.createdAt = data.createdAt || new Date();
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async save() {
    mockStorage.users.set(this._id, this);
    return this;
  }

  toObject() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      otpMethod: this.otpMethod,
      tickets: this.tickets,
      createdAt: this.createdAt
    };
  }

  toJSON() {
    return this.toObject();
  }
}

// Mock Event class for fallback
class MockEvent {
  constructor(data) {
    this._id = data._id || String(eventIdCounter++);
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.time = data.time;
    this.location = data.location;
    this.price = data.price;
    this.category = data.category;
    this.capacity = data.capacity;
    this.image = data.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80';
    this.organizer = data.organizer;
    this.attendees = data.attendees || [];
    this.createdAt = data.createdAt || new Date();
  }

  get availableTickets() {
    const totalBooked = this.attendees.reduce((sum, a) => sum + (a.quantity || 0), 0);
    return this.capacity - totalBooked;
  }

  async save() {
    mockStorage.events.set(this._id, this);
    return this;
  }

  async deleteOne() {
    mockStorage.events.delete(this._id);
  }

  toObject() {
    return {
      _id: this._id,
      title: this.title,
      description: this.description,
      date: this.date,
      time: this.time,
      location: this.location,
      price: this.price,
      category: this.category,
      capacity: this.capacity,
      image: this.image,
      organizer: this.organizer,
      attendees: this.attendees,
      createdAt: this.createdAt,
      availableTickets: this.availableTickets
    };
  }

  toJSON() {
    return this.toObject();
  }
}

// Create User model (MongoDB, Firebase, or Mock)
let User, Event;
let useMongoDB = false;
let useFirebase = false;
let firestore = null;

const connectDB = async () => {
  // Try MongoDB first
  const mongoUri = process.env.MONGODB_URI;
  
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000
      });
      
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      useMongoDB = true;

      const UserModel = require('../models/User');
      const EventModel = require('../models/Event');
      
      // MongoDB User model
      User = {
        findOne: async (query) => await UserModel.findOne(query),
        findById: async (id) => await UserModel.findById(id),
        create: async (data) => {
          const doc = new UserModel(data);
          return await doc.save();
        }
      };
      
      // MongoDB Event model
      Event = {
        find: async (query = {}) => {
          let q = {};
          if (query.date?.$gte) q.date = { $gte: new Date(query.date.$gte) };
          if (query.organizer) q.organizer = query.organizer;
          return await EventModel.find(q).sort({ date: 1 });
        },
        findById: async (id) => await EventModel.findById(id),
        findOne: async (query) => await EventModel.findOne(query),
        create: async (data) => {
          const doc = new EventModel(data);
          return await doc.save();
        },
        deleteOne: async (query) => {
          await EventModel.deleteOne(query);
        }
      };

      return { User, Event, useMongoDB: true };
    } catch (error) {
      console.log('MongoDB connection failed:', error.message);
      console.log('Falling back to mock database...');
      useMongoDB = false;
    }
  }

  // Try Firebase as fallback
  firestore = getFirestore();
  
  if (firestore) {
    try {
      await firestore.collection('test').doc('connection-test').get();
      await firestore.collection('test').doc('connection-test').delete();
      
      console.log('Firebase Firestore connected successfully');
      useFirebase = true;

      // Firebase User model
      User = {
        findOne: async (query) => {
          let collection = firestore.collection('users');
          let snapshot;
          
          if (query.email) {
            snapshot = await collection.where('email', '==', query.email).get();
          } else if (query._id) {
            const doc = await collection.doc(query._id).get();
            if (doc.exists) {
              return { _id: doc.id, ...doc.data() };
            }
            return null;
          }
          
          if (snapshot.empty) return null;
          const doc = snapshot.docs[0];
          return { _id: doc.id, ...doc.data() };
        },
        findById: async (id) => {
          const doc = await firestore.collection('users').doc(id).get();
          if (!doc.exists) return null;
          return { _id: doc.id, ...doc.data() };
        },
        create: async (data) => {
          const docRef = await firestore.collection('users').add({
            ...data,
            createdAt: new Date()
          });
          return { _id: docRef.id, ...data };
        }
      };

      // Firebase Event model
      Event = {
        find: async (query = {}) => {
          let collection = firestore.collection('events');
          let snapshot = await collection.orderBy('date', 'asc').get();
          
          let results = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
          
          if (query.date?.$gte) {
            results = results.filter(e => new Date(e.date) >= new Date(query.date.$gte));
          }
          if (query.organizer) {
            results = results.filter(e => String(e.organizer) === String(query.organizer));
          }
          
          return results;
        },
        findById: async (id) => {
          const doc = await firestore.collection('events').doc(id).get();
          if (!doc.exists) return null;
          return { _id: doc.id, ...doc.data() };
        },
        findOne: async (query) => {
          if (query._id) {
            const doc = await firestore.collection('events').doc(query._id).get();
            if (!doc.exists) return null;
            return { _id: doc.id, ...doc.data() };
          }
          return null;
        },
        create: async (data) => {
          const docRef = await firestore.collection('events').add({
            ...data,
            createdAt: new Date()
          });
          return { _id: docRef.id, ...data };
        },
        deleteOne: async (query) => {
          if (query._id) {
            await firestore.collection('events').doc(query._id).delete();
          }
        }
      };

      return { User, Event, useFirebase: true };
    } catch (error) {
      console.log('Firebase connection failed:', error.message);
      useFirebase = false;
    }
  }

  // Fallback to mock database
  console.log('Using mock database (no MongoDB or Firebase configured)');
  
  User = {
    findOne: async (query) => {
      for (const user of mockStorage.users.values()) {
        if (query.email && user.email === query.email) return user;
        if (query._id && user._id === query._id) return user;
      }
      return null;
    },
    findById: async (id) => mockStorage.users.get(id) || null,
    create: async (data) => {
      const user = new MockUser(data);
      await user.save();
      return user;
    }
  };

  Event = {
    find: async (query = {}) => {
      let results = Array.from(mockStorage.events.values());
      if (query.date?.$gte) {
        results = results.filter(e => new Date(e.date) >= new Date(query.date.$gte));
      }
      if (query.organizer) {
        results = results.filter(e => String(e.organizer) === String(query.organizer));
      }
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
      return results;
    },
    findById: async (id) => mockStorage.events.get(id) || null,
    findOne: async (query) => {
      for (const event of mockStorage.events.values()) {
        if (query._id && event._id !== query._id) continue;
        if (query.organizer && String(event.organizer) !== String(query.organizer)) continue;
        return event;
      }
      return null;
    },
    create: async (data) => {
      const event = new MockEvent(data);
      await event.save();
      return event;
    },
    deleteOne: async (query) => {
      if (query._id) {
        mockStorage.events.delete(query._id);
      }
    }
  };

  // Add sample events if none exist
  if (mockStorage.events.size === 0) {
    const sampleEvents = [
      {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest innovations in AI, blockchain, and cloud computing.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '09:00',
        location: 'Nairobi Convention Center',
        price: 1500,
        category: 'conference',
        capacity: 500,
        organizer: 'demo-organizer',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
      },
      {
        title: 'Summer Music Festival',
        description: 'The biggest music festival of the year with top artists.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '16:00',
        location: 'Kasarani Stadium',
        price: 2000,
        category: 'concert',
        capacity: 10000,
        organizer: 'demo-organizer',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80'
      },
      {
        title: 'Business Workshop',
        description: 'Learn essential business skills from industry experts.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: '10:00',
        location: 'Sarit Centre',
        price: 500,
        category: 'workshop',
        capacity: 100,
        organizer: 'demo-organizer',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80'
      }
    ];

    for (const eventData of sampleEvents) {
      await Event.create(eventData);
    }
    console.log('Sample events created in mock database');
  }

  return { User, Event, useMongoDB: false, useFirebase: false };
};

// Export for use in controllers
const getMockStorage = () => mockStorage;

module.exports = { 
  connectDB, 
  User, 
  Event, 
  generateToken,
  jwt,
  JWT_SECRET,
  bcrypt,
  getMockStorage,
  useMongoDB: () => useMongoDB,
  useFirebase: () => useFirebase
};
