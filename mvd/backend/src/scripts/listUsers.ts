import dotenv from "dotenv";
import connectDB from "../config/database";
import User from "../models/UserModel";

// Load environment variables
dotenv.config();

const listUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all users
    const users = await User.find({}, '-password'); // Exclude passwords
    
    console.log("Users in database:");
    console.log("==================");
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
      console.log("------------------");
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error listing users:", error);
    process.exit(1);
  }
};

listUsers();