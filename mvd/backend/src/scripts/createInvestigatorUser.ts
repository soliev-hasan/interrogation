import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/database";
import User from "../models/UserModel";

// Load environment variables
dotenv.config();

const createInvestigatorUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if investigator user already exists
    const existingInvestigator = await User.findOne({ email: "investigator@mvd.ru" });
    if (existingInvestigator) {
      console.log("Investigator user already exists:");
      console.log(`Username: ${existingInvestigator.username}`);
      console.log(`Email: ${existingInvestigator.email}`);
      console.log(`Role: ${existingInvestigator.role}`);
      process.exit(0);
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("investigator123", saltRounds);
    
    // Create investigator user
    const investigatorUser = new User({
      username: "investigator",
      email: "investigator@mvd.ru",
      password: hashedPassword,
      role: "investigator"
    });
    
    await investigatorUser.save();
    
    console.log("Investigator user created successfully:");
    console.log(`Username: ${investigatorUser.username}`);
    console.log(`Email: ${investigatorUser.email}`);
    console.log(`Role: ${investigatorUser.role}`);
    console.log("Password: investigator123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating investigator user:", error);
    process.exit(1);
  }
};

createInvestigatorUser();