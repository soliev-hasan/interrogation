import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/database";
import User from "../models/UserModel";

// Load environment variables
dotenv.config();

const createAdminWithoutEmail = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get username and password from command line arguments
    const args = process.argv.slice(2);
    let username = "admin2";
    let password = "admin123";

    if (args.length >= 2) {
      username = args[0];
      password = args[1];
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
      console.log(`Admin user with username '${username}' already exists:`);
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email || "Not set"}`);
      console.log(`Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user without email
    const adminUser = new User({
      username: username,
      email: `${username}@mvd.local`, // Unique email for each admin
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();

    console.log("Admin user created successfully:");
    console.log(`Username: ${adminUser.username}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminWithoutEmail();
