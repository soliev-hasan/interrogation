import bcrypt from "bcryptjs";
import { appDataSource } from "../config/database";
import { UserEntity, UserRole } from "../entities";

// Adjust this to your actual datasource config file if you already have one
const createAdminUser = async () => {
  try {
    // Connect DB
    await appDataSource.initialize();
    const userRepo = appDataSource.getRepository(UserEntity);

    // Check if admin exists
    const existingAdmin = await userRepo.findOne({
      where: { email: "admin@mvd.ru" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const adminUser = userRepo.create({
      username: "admin",
      email: "admin@mvd.ru",
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepo.save(adminUser);

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
