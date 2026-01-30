import bcrypt from "bcryptjs";
import { appDataSource } from "../config/database";
import { UserEntity, UserRole } from "../entities";

const createAdminWithoutEmail = async () => {
  try {
    // Connect DB
    await appDataSource.initialize();
    const userRepo = appDataSource.getRepository(UserEntity);

    // CLI args: node script.js <username> <password>
    const args = process.argv.slice(2);

    let username = "admin2";
    let password = "admin123";

    if (args.length >= 2) {
      username = args[0];
      password = args[1];
    }

    // Check if admin already exists
    const existingAdmin = await userRepo.findOne({
      where: { username },
    });

    if (existingAdmin) {
      console.log(`Admin user with username '${username}' already exists:`);
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email ?? "Not set"}`);
      console.log(`Role: ${existingAdmin.role}`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = userRepo.create({
      username,
      email: `${username}@mvd.local`, // unique placeholder email
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepo.save(adminUser);

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
