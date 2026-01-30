import bcrypt from "bcryptjs";
import { appDataSource } from "../config/database";
import { UserEntity, UserRole } from "../entities";

const createInvestigatorUser = async () => {
  try {
    // Connect DB
    await appDataSource.initialize();
    const userRepo = appDataSource.getRepository(UserEntity);

    // Check if investigator already exists
    const existingInvestigator = await userRepo.findOne({
      where: { email: "investigator@mvd.ru" },
    });

    if (existingInvestigator) {
      console.log("Investigator user already exists:");
      console.log(`Username: ${existingInvestigator.username}`);
      console.log(`Email: ${existingInvestigator.email}`);
      console.log(`Role: ${existingInvestigator.role}`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("investigator123", 10);

    // Create investigator user
    const investigatorUser = userRepo.create({
      username: "investigator",
      email: "investigator@mvd.ru",
      password: hashedPassword,
      role: UserRole.INVESTIGATOR,
    });

    await userRepo.save(investigatorUser);

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
