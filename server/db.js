const mongoose = require("mongoose")

const connectDB = async () => {
  try {
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

    const collections = await db.listCollections().toArray();
    console.log("Collections in the database:");
    if (collections.length === 0) {
      console.log("No collections found in the database.");
    } else {
      collections.forEach((collection) => console.log(`- ${collection.name}`));
    }

    return db;
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    throw new Error("Failed to connect to the database");
  }
};

module.exports = connectDB;
