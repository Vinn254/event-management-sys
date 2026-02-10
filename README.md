# Event Management System

A full-stack web application for discovering, booking, and managing events. Built with Node.js/Express backend, MongoDB Atlas/Firebase, and Vite-powered React frontend.

## Features

### For Users
- **Discover Events**: Browse upcoming events with filtering and search
- **Easy Booking**: Book tickets with secure M-Pesa payment integration
- **Ticket Management**: View and download tickets in PDF format
- **Transaction History**: Track all payments and bookings

### For Organizers
- **Create Events**: Comprehensive event creation with categories
- **Manage Events**: Edit or delete your events
- **Analytics Dashboard**: Track revenue, attendance, and sales trends
- **Performance Charts**: Visual insights with Recharts integration

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB Atlas / Firebase Firestore
- JWT Authentication with bcrypt
- PDF Ticket Generation with PDFKit
- Cloudinary for image uploads
- M-Pesa Daraja API for payments

### Frontend
- React 18 with Vite
- React Router v6
- Context API for state management
- Recharts for analytics visualization
- Axios for API calls

## Project Structure

```
event-management-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # Database connection (MongoDB/Firebase)
│   │   ├── config/firebase.js    # Firebase configuration
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/auth.js    # JWT authentication
│   │   ├── models/               # Mongoose schemas
│   │   ├── routes/               # API routes
│   │   └── server.js             # Express app entry
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/           # Reusable components
    │   ├── context/             # React context providers
    │   ├── pages/               # Page components
    │   ├── App.jsx             # Main app with routing
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── package.json
    └── vite.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or Firebase)
- npm or yarn

### Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

Configure the following variables:

```env
# Database (choose one)
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/?appName=Cluster0

# Or Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# M-Pesa Daraja (payments)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PAYBILL_NUMBER=your_paybill
MPESA_PASSKEY=your_passkey

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd event-management-system/backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd event-management-system/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Production Build

```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/tickets` - Get user tickets

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (organizer only)
- `PUT /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Delete event (organizer only)
- `GET /api/events/my-events` - Get organizer's events

### Payments
- `POST /api/payments/process` - Process payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/ticket/:ticketNumber` - Download PDF ticket

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics (organizer only)
- `GET /api/analytics/event/:eventId` - Get event analytics (organizer only)

## User Roles

### Regular User
- Browse and search events
- Book tickets
- View purchased tickets
- Download PDF tickets

### Event Organizer
- All user features
- Create, edit, delete events
- View event analytics
- Access organizer dashboard

## License

MIT License

## Support

For issues and questions, please open a GitHub issue.
