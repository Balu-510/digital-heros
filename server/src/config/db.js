import mongoose from 'mongoose';

// Cache the connection promise so serverless invocations reuse it
// instead of opening a new connection on every request.
let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = null; // allow retry on next request
        throw error;
      });
  }

  return connectionPromise;
};
