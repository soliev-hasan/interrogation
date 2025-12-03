import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/database";
import User from "../models/UserModel";

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@mvd.ru" });
    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      process.exit(0);
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("admin123", saltRounds);
    
    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@mvd.ru",
      password: hashedPassword,
      role: "admin"
    });
    
    await adminUser.save();
    
    console.log("Admin user created successfully:");
    console.log(`Username: ${adminUser.username}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();