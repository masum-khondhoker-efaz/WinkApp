import mongoose from 'mongoose';
import app from './app.js';
import { DATABASE_URL, PORT } from './app/config/config.js';
// import crypto from 'crypto';

// Function to connect to the database
async function connectDB() {
  try {
    await mongoose.connect(DATABASE_URL, { autoIndex: true });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Disconnected', error);
    process.exit(1); // Exit process if connection fails
  }
}

// Main function to start the app
async function startServer() {
  // Connect to the database
  await connectDB();

  // Start the server locally if running in development or production mode
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
// console.log(crypto.randomBytes(32).toString('hex'));

// // Only call startServer if this script is being run directly
// if (process.env.NODE_ENV !== 'vercel') {
startServer();
// }

// export default app; // Export the app for Vercel
