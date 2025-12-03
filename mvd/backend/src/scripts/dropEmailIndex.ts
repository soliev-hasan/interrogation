import dotenv from "dotenv";
import connectDB from "../config/database";
import User from "../models/UserModel";

// Load environment variables
dotenv.config();

const dropEmailIndex = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get the collection
    const collection = User.collection;

    // List all indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:");
    console.log(JSON.stringify(indexes, null, 2));

    // Check if email_1 index exists and is unique
    const emailIndex = indexes.find((index: any) => index.name === "email_1");
    if (emailIndex && emailIndex.unique) {
      console.log("Dropping unique index on email field...");
      await collection.dropIndex("email_1");
      console.log("Unique index on email field dropped successfully.");
    } else {
      console.log("No unique index found on email field.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error dropping email index:", error);
    process.exit(1);
  }
};

dropEmailIndex();
