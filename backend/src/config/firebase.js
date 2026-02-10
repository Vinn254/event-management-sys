const admin = require('firebase-admin');

// Firebase configuration - can be set via environment variables or service account file
let firebaseConfig = null;

// Check for environment variables first
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  firebaseConfig = {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  };
} else {
  // Try to load from service account file
  try {
    const serviceAccount = require('../../firebase-service-account.json');
    firebaseConfig = {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: serviceAccount.databaseURL || `https://${serviceAccount.project_id}.firebaseio.com`
    };
  } catch (error) {
    console.log('Firebase service account file not found. Using mock database.');
    firebaseConfig = null;
  }
}

let initialized = false;

const initializeFirebase = () => {
  if (initialized) return admin.firestore();
  
  if (firebaseConfig) {
    try {
      admin.initializeApp(firebaseConfig);
      initialized = true;
      console.log('Firebase initialized successfully');
      return admin.firestore();
    } catch (error) {
      console.log('Firebase initialization failed:', error.message);
      return null;
    }
  }
  return null;
};

const getFirestore = () => {
  return initializeFirebase();
};

module.exports = {
  admin,
  initializeFirebase,
  getFirestore
};
