const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in environment variables');
    if (process.env.NODE_ENV !== 'production') process.exit(1);
    return;
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      isConnected = true;
      console.log('MongoDB connected');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    isConnected = false;
    if (process.env.NODE_ENV !== 'production') process.exit(1);
  }
};

module.exports = connectDB;
