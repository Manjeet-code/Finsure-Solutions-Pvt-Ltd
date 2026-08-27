import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/finsure';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`[DB Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

