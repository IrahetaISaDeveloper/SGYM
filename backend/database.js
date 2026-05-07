import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('=> Usando conexión existente a MongoDB');
    return;
  }
  
  try {
    const conn = await mongoose.connect(MONGO_URI);
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // No hacer process.exit en producción/Vercel
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};
