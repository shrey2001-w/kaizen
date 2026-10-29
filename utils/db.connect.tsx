// lib/dbConnect.ts
import mongoose from 'mongoose';

const connectDB = async (): Promise<mongoose.Connection['db']> => {
  try {
    // If already connected, return the existing connection's DB instance.
    if (mongoose.connection.readyState === 1) {
      console.log("Database is already connected");
      return mongoose.connection.db;
    }

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const connection = await mongoose.connect(MONGO_URI);
    console.log("Database connection successful");

    const db = connection.connection.db;
    if (!db) {
        throw new Error("Failed to get database instance");
    }

    // List collections in the database for debugging purposes.
    const collections = await db.listCollections().toArray();
    console.log("Collections in the database:");
    if (collections.length === 0) {
      console.log("No collections found in the database.");
    } else {
      collections.forEach((collection: { name: string }) => {
        console.log(`- ${collection.name}`);
      });
    }

    return db;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error connecting to the database:", error.message);
    } else {
      console.error("Error connecting to the database:", error);
    }
    throw new Error("Failed to connect to the database");
  }
};

export default connectDB;
