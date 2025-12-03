import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Use MongoDB Atlas URI from environment variables, fallback to local MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/mvd_db";
    console.log(
      "Attempting to connect to MongoDB with URI:",
      mongoUri.split("?")[0]
    ); // Hide query params for security

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Log connection status
    console.log(`Connection state: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    console.error(
      "Connection failed. Please check your MONGODB_URI in .env file."
    );

    // Exit process with failure code
    process.exit(1);
  }
};

export default connectDB;
